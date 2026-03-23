// app/api/brigades/donate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { amount } = await req.json();
        const donation = parseInt(amount);

        // Anti-triche basique
        if (isNaN(donation) || donation <= 0) {
            return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return NextResponse.json({ error: "Agent introuvable." }, { status: 404 });
        if (!user.brigadeId) return NextResponse.json({ error: "Vous n'appartenez à aucun syndicat." }, { status: 400 });
        if (user.walletBalance < donation) return NextResponse.json({ error: "Fonds insuffisants. Vous êtes à sec !" }, { status: 400 });

        // Transaction ultra sécurisée : on retire au joueur, on donne à la brigade en même temps !
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { walletBalance: { decrement: donation } }
            }),
            prisma.brigade.update({
                where: { id: user.brigadeId },
                data: { bank: { increment: donation } }
            })
        ]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erreur de transfert:", error);
        return NextResponse.json({ error: "La valise de billets a été perdue en route." }, { status: 500 });
    }
}