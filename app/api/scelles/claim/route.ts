// app/api/scelles/claim/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { updateMissionProgress } from "@/lib/missions"; // <-- Le mouchard

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { amount } = await req.json();
        
        if (amount <= 0 || amount > 5000) {
            return NextResponse.json({ error: "Montant suspect, l'IGPN enquête..." }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: { walletBalance: { increment: amount } }
        });

        // <-- ON DÉCLENCHE L'AVANCÉE DE LA MISSION ICI
        await updateMissionProgress(user.id, "PLAY_SCELLES");

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Bavure technique lors du transfert." }, { status: 500 });
    }
}