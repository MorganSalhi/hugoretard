// app/api/rackets/buy/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { RACKETS_DEFINITIONS } from "@/lib/rackets";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { racketId } = await req.json();
        const racketDef = RACKETS_DEFINITIONS[racketId as keyof typeof RACKETS_DEFINITIONS];

        if (!racketDef) return NextResponse.json({ error: "Territoire non répertorié" }, { status: 400 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { rackets: true }
        });

        if (!user || user.walletBalance < racketDef.cost) {
            return NextResponse.json({ error: "Fonds de saisie insuffisants" }, { status: 400 });
        }

        // On vérifie s'il possède déjà ce racket
        if (user.rackets.some(r => r.racketType === racketId)) {
            return NextResponse.json({ error: "Vous contrôlez déjà ce territoire." }, { status: 400 });
        }

        // Transaction : On lui prend l'argent et on lui donne le territoire
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { walletBalance: { decrement: racketDef.cost } }
            }),
            prisma.userRacket.create({
                data: { userId: user.id, racketType: racketId }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur d'achat territoire:", error);
        return NextResponse.json({ error: "Erreur lors de la transaction" }, { status: 500 });
    }
}