// app/api/missions/get/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { generateRandomMissions } from "@/lib/missions";

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { missions: true }
        });

        if (!user) return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });

        const now = new Date();
        const lastReset = new Date(user.lastDailyReset);
        
        // Est-ce qu'on est un nouveau jour ? (On compare les dates)
        const isNewDay = now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

        // Si c'est un nouveau jour, on supprime les vieilles missions et on en crée 3 nouvelles !
        if (isNewDay || user.missions.length === 0) {
            const newMissions = generateRandomMissions();

            // On efface les anciennes
            await prisma.dailyMission.deleteMany({ where: { userId: user.id } });

            // On crée les nouvelles et on met à jour la date de reset
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastDailyReset: now,
                    missions: {
                        create: newMissions.map(m => ({
                            actionType: m.type,
                            description: m.desc,
                            target: m.target
                        }))
                    }
                }
            });

            // On renvoie les missions toutes fraîches
            const freshUser = await prisma.user.findUnique({ where: { id: user.id }, include: { missions: true }});
            return NextResponse.json({ missions: freshUser?.missions, lootboxes: freshUser?.lootboxes });
        }

        // Si on est le même jour, on renvoie juste les missions actuelles
        return NextResponse.json({ missions: user.missions, lootboxes: user.lootboxes });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de l'accès aux dossiers" }, { status: 500 });
    }
}