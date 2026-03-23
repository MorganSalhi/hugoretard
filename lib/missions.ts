// lib/missions.ts
import { prisma } from "@/lib/prisma"; // <-- Oublie pas l'import de Prisma !

export const MISSION_TYPES = [
    { type: "PLACE_BETS", desc: "Dresser des PV (Faire des rapports)", target: 2 },
    { type: "USE_IGPN", desc: "Balancer un collègue (Marché Noir)", target: 1 },
    { type: "PLAY_SCELLES", desc: "Faire un casse (Salle des Scellés)", target: 1 },
    { type: "BUY_SHOP", desc: "Acheter du matériel tactique", target: 1 },
];

export function generateRandomMissions() {
    const shuffled = [...MISSION_TYPES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

// NOUVELLE FONCTION : Fait avancer la jauge et donne la caisse
export async function updateMissionProgress(userId: string, actionType: string, amount: number = 1) {
    try {
        // 1. On cherche si l'agent a cette mission en cours (et non terminée)
        const mission = await prisma.dailyMission.findFirst({
            where: { userId, actionType, completed: false }
        });

        if (!mission) return; // Mission déjà finie ou pas dans sa liste du jour

        // 2. On calcule la nouvelle progression
        const newProgress = Math.min(mission.progress + amount, mission.target);
        const isCompleted = newProgress >= mission.target;

        // 3. On met à jour la base de données
        await prisma.dailyMission.update({
            where: { id: mission.id },
            data: { progress: newProgress, completed: isCompleted }
        });

        // 4. Si la mission vient de se terminer, on vérifie s'il a fini TOUT son quota
        if (isCompleted) {
            const allMissions = await prisma.dailyMission.findMany({ where: { userId } });
            const allDone = allMissions.length > 0 && allMissions.every(m => m.completed);

            if (allDone) {
                // JACKPOT : On lui donne sa caisse de contrebande !
                await prisma.user.update({
                    where: { id: userId },
                    data: { lootboxes: { increment: 1 } }
                });
            }
        }
    } catch (error) {
        console.error("Erreur update mission:", error);
    }
}