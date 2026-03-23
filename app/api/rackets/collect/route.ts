// app/api/rackets/collect/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { RACKETS_DEFINITIONS } from "@/lib/rackets";

export async function POST() {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const currentEvent = await prisma.globalEvent.findUnique({ where: { id: "CURRENT_EVENT" } });
        if (currentEvent && new Date() < new Date(currentEvent.expiresAt) && currentEvent.type === "FREEZE_RACKETS") {
            return NextResponse.json({ error: "Descente de l'IGPN en cours ! L'économie souterraine est gelée." }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { rackets: true }
        });

        if (!user || user.rackets.length === 0) {
            return NextResponse.json({ error: "Aucun territoire à racketter" }, { status: 400 });
        }

        const now = new Date();
        let totalCollected = 0;

        // On calcule les gains pour CHAQUE territoire possédé
        const updatePromises = user.rackets.map((racket) => {
            const definition = RACKETS_DEFINITIONS[racket.racketType as keyof typeof RACKETS_DEFINITIONS];
            if (!definition) return null;

            // Calcul du temps écoulé en minutes
            const minutesPassed = Math.floor((now.getTime() - racket.lastCollectedAt.getTime()) / (1000 * 60));
            
            // Si moins d'une minute s'est écoulée, on ne récolte rien pour ce commerce
            if (minutesPassed < 1) return null;

            // Calcul du gain (Gain horaire divisé par 60 pour avoir le gain par minute)
            const gainPerMinute = definition.hourlyYield / 60;
            const generatedAmount = Math.floor(minutesPassed * gainPerMinute);

            totalCollected += generatedAmount;

            // On met à jour l'heure de la dernière récolte
            return prisma.userRacket.update({
                where: { id: racket.id },
                data: { lastCollectedAt: now }
            });
        });

        // On exécute toutes les mises à jour (seulement celles qui ont généré quelque chose)
        const validUpdates = updatePromises.filter(p => p !== null);
        
        if (totalCollected > 0) {
            await prisma.$transaction([
                ...validUpdates as any,
                prisma.user.update({
                    where: { email: session.user.email },
                    data: { walletBalance: { increment: totalCollected } }
                })
            ]);
        }

        return NextResponse.json({ success: true, amount: totalCollected });

    } catch (error) {
        console.error("Erreur de récolte:", error);
        return NextResponse.json({ error: "Erreur lors du ramassage des enveloppes" }, { status: 500 });
    }
}