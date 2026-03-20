// app/api/resolve/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateHugoScore } from "@/lib/scoring";
import { checkAndAwardBadges } from "@/lib/badges";

export async function POST(req: Request) {
  try {
    const { courseId, actualTime } = await req.json();

    if (!courseId || !actualTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(actualTime)) {
      return NextResponse.json({ error: "Données de temps invalides" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { 
        bets: {
          include: { user: true } 
        } 
      },
    });

    if (!course) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    if (course.status === "FINISHED") return NextResponse.json({ error: "Enquête déjà classée" }, { status: 400 });

    const [actualH, actualM] = actualTime.split(":").map(Number);
    const actualMinutes = actualH * 60 + actualM;

    // --- LOGIQUE WANTED LIST ---
    const wantedTarget = await prisma.user.findFirst({
        orderBy: { walletBalance: 'desc' }
    });

    const wantedBet = course.bets.find(b => b.userId === wantedTarget?.id);
    let wantedScore = 0;
    if (wantedBet) {
        const wDate = new Date(wantedBet.guessedTime);
        const wMin = wDate.getHours() * 60 + wDate.getMinutes();
        
        // Si le N°1 a été saboté, on applique aussi son malus !
        const wMalus = wantedBet.user.nextBetMalus || 0;
        const wDirection = wMin >= actualMinutes ? 1 : -1;
        const wEffectiveMin = wMin + (wDirection * wMalus);

        wantedScore = calculateHugoScore(actualMinutes, wEffectiveMin);
    }
    // ----------------------------

    const betUpdates = course.bets.flatMap((bet) => {
      const guessedDate = new Date(bet.guessedTime);
      const guessedMinutes = guessedDate.getHours() * 60 + guessedDate.getMinutes();
      
      // --- APPLICATION DU MALUS DE SABOTAGE ---
      const malus = bet.user.nextBetMalus || 0;
      // On éloigne artificiellement le pronostic de l'heure réelle
      const direction = guessedMinutes >= actualMinutes ? 1 : -1;
      const effectiveGuessedMinutes = guessedMinutes + (direction * malus);

      const baseScore = calculateHugoScore(actualMinutes, effectiveGuessedMinutes);
      // ----------------------------------------

      let streakBonus = 1;
      const currentStreak = bet.user.currentStreak;
      
      if (currentStreak >= 10) streakBonus = 2.0;
      else if (currentStreak >= 5) streakBonus = 1.5;
      else if (currentStreak >= 3) streakBonus = 1.2;

      let gainsReels = Math.round((baseScore / 100) * bet.amount * streakBonus);
      let gainsFinaux = gainsReels;

      if (bet.appliedItem === "WARRANT") {
        gainsFinaux *= 2;
      } else if (bet.appliedItem === "VEST") {
        if (gainsReels < bet.amount) {
          const perte = bet.amount - gainsReels;
          gainsFinaux = Math.round(gainsReels + (perte / 2));
        }
      }

      if (bet.userId !== wantedTarget?.id && wantedScore > 0 && baseScore > wantedScore) {
          gainsFinaux += 5000;
      }

      let nextStreak = currentStreak;
      
      if (gainsFinaux > bet.amount) {
          nextStreak += 1;
      } else if (gainsFinaux < bet.amount) {
          nextStreak = 0;
      } 

      return [
        prisma.bet.update({
          where: { id: bet.id },
          data: { pointsEarned: gainsFinaux },
        }),
        prisma.user.update({
          where: { id: bet.userId },
          data: { 
            walletBalance: { increment: gainsFinaux },
            currentStreak: nextStreak,
            bestStreak: nextStreak > bet.user.bestStreak ? nextStreak : bet.user.bestStreak,
            // ON NETTOIE LE RESERVOIR : Le malus a été consommé, on le remet à 0
            nextBetMalus: 0 
          },
        }),
      ];
    });

    await prisma.$transaction([
      ...betUpdates,
      prisma.course.update({
        where: { id: courseId },
        data: {
          status: "FINISHED",
          actualArrivalTime: new Date(new Date().setHours(actualH, actualM, 0, 0))
        },
      }),
    ]);

    for (const bet of course.bets) {
      const gDate = new Date(bet.guessedTime);
      const gMinutes = gDate.getHours() * 60 + gDate.getMinutes();
      
      const malus = bet.user.nextBetMalus || 0;
      const direction = gMinutes >= actualMinutes ? 1 : -1;
      const effectiveGuessedMinutes = gMinutes + (direction * malus);

      const score = calculateHugoScore(actualMinutes, effectiveGuessedMinutes);
      
      if (score === 1000) {
        await prisma.badge.upsert({
          where: { userId_type: { userId: bet.userId, type: "SNIPER" } },
          update: {},
          create: { userId: bet.userId, type: "SNIPER" }
        });
      }
      
      await checkAndAwardBadges(bet.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur de résolution:", error);
    return NextResponse.json({ error: "Échec du verdict" }, { status: 500 });
  }
}