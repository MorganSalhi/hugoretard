// app/api/pvp/use/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { updateMissionProgress } from "@/lib/missions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { targetId, itemType } = await req.json();

        const attacker = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { items: true }
        });

        // 1. Vérifier si l'attaquant possède bien l'objet
        const itemOwned = attacker?.items.find(i => i.itemType === itemType && i.quantity > 0);
        if (!attacker || !itemOwned) {
            return NextResponse.json({ error: "Vous ne possédez pas cet objet." }, { status: 400 });
        }

        // 2. Empêcher de s'attaquer soi-même
        if (attacker.id === targetId) {
            return NextResponse.json({ error: "L'IGPN vous regarde bizarrement..." }, { status: 400 });
        }

        const target = await prisma.user.findUnique({ where: { id: targetId } });
        if (!target) return NextResponse.json({ error: "Cible introuvable." }, { status: 404 });

        // 3. Appliquer l'effet selon l'objet utilisé
        let updateData = {};
        if (itemType === "IGPN_LETTER") {
            if (target.currentStreak === 0) return NextResponse.json({ error: "La cible est déjà au fond du trou." }, { status: 400 });
            updateData = { currentStreak: 0 };
        } else if (itemType === "SUGAR") {
            updateData = { nextBetMalus: { increment: 2 } }; // +2 minutes de malus !
        } else {
            return NextResponse.json({ error: "Objet non utilisable de cette façon." }, { status: 400 });
        }

        // 4. Transaction finale (on consomme l'objet et on frappe la cible)
        await prisma.$transaction([
            prisma.userItem.update({
                where: { id: itemOwned.id },
                data: { quantity: { decrement: 1 } }
            }),
            prisma.user.update({
                where: { id: targetId },
                data: updateData
            })
        ]);
        await updateMissionProgress(attacker.id, "USE_IGPN");
        return NextResponse.json({ success: true, targetName: target.name });

    } catch (error) {
        return NextResponse.json({ error: "Bavure technique lors du sabotage." }, { status: 500 });
    }
}