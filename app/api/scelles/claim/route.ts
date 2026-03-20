// app/api/scelles/claim/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { amount } = await req.json();
        
        // Anti-triche basique (personne ne peut gagner 100 000 d'un coup sur un jeu snake)
        if (amount <= 0 || amount > 5000) {
            return NextResponse.json({ error: "Montant suspect, l'IGPN enquête..." }, { status: 400 });
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: { walletBalance: { increment: amount } }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Bavure technique lors du transfert." }, { status: 500 });
    }
}