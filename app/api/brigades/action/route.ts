// app/api/brigades/action/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { action, name, brigadeId } = await req.json();
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });

        if (!user) return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });

        // ACTION 1 : FONDER UNE BRIGADE
        if (action === "CREATE") {
            if (user.brigadeId) return NextResponse.json({ error: "Vous êtes déjà dans un syndicat." }, { status: 400 });
            if (!name || name.trim() === "") return NextResponse.json({ error: "Nom de brigade invalide." }, { status: 400 });

            const existing = await prisma.brigade.findUnique({ where: { name } });
            if (existing) return NextResponse.json({ error: "Ce nom est déjà pris par un autre gang." }, { status: 400 });

            await prisma.brigade.create({
                data: {
                    name,
                    leaderId: user.id,
                    members: { connect: { id: user.id } } // On l'ajoute directement dedans !
                }
            });
            return NextResponse.json({ success: true });
        }

        // ACTION 2 : REJOINDRE UNE BRIGADE
        if (action === "JOIN") {
            if (user.brigadeId) return NextResponse.json({ error: "Vous êtes déjà dans un syndicat." }, { status: 400 });
            if (!brigadeId) return NextResponse.json({ error: "Brigade introuvable." }, { status: 400 });

            await prisma.user.update({
                where: { id: user.id },
                data: { brigadeId }
            });
            return NextResponse.json({ success: true });
        }
        
        // ACTION 3 : DÉSERTER (QUITTER LA BRIGADE)
        if (action === "LEAVE") {
            if (!user.brigadeId) return NextResponse.json({ error: "Vous n'êtes dans aucune brigade." }, { status: 400 });
            
            await prisma.user.update({
                where: { id: user.id },
                data: { brigadeId: null }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Action inconnue." }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de l'opération." }, { status: 500 });
    }
}