// app/api/courses/live/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Désactive le cache pour toujours avoir les données en temps réel
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // On regarde si c're l'interface Admin qui demande TOUS les paris (?all=true)
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    if (all === "true") {
      const courses = await prisma.course.findMany({
        where: { status: "OPEN" },
        orderBy: { scheduledStartTime: "asc" },
      });
      // Renvoie une liste (vide si aucun pari, ce qui empêche le crash)
      return NextResponse.json(courses);
    }

    // Logique classique pour le Lobby (demande le pari en cours)
    const course = await prisma.course.findFirst({
      where: { status: "OPEN" },
      orderBy: { scheduledStartTime: "asc" },
      include: {
        bets: {
          select: { guessedTime: true }
        }
      }
    });

    if (!course) return NextResponse.json(null);

    let averageTime: string | null = null;

    if (course.bets.length > 0) {
      const totalMinutes = course.bets.reduce((acc: number, bet: any) => {
        const d = new Date(bet.guessedTime);
        return acc + (d.getHours() * 60 + d.getMinutes());
      }, 0);

      const avgMinutes = Math.round(totalMinutes / course.bets.length);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      averageTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return NextResponse.json({
      ...course,
      averageEstimate: averageTime
    });
  } catch (error) {
    console.error("Erreur API Live Course:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}