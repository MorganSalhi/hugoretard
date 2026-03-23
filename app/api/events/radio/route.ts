// app/api/events/radio/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getRandomEvent } from "@/lib/events";

// Récupérer l'alerte en cours (Pour tous les joueurs)
export async function GET() {
    try {
        const event = await prisma.globalEvent.findUnique({
            where: { id: "CURRENT_EVENT" }
        });

        // Si l'événement est périmé, on fait comme s'il n'y en avait pas
        if (event && new Date() > new Date(event.expiresAt)) {
            await prisma.globalEvent.delete({ where: { id: "CURRENT_EVENT" } });
            return NextResponse.json({ event: null });
        }

        return NextResponse.json({ event });
    } catch (error) {
        return NextResponse.json({ error: "Interférences radio." }, { status: 500 });
    }
}

// Déclencher ou couper une alerte (Réservé à l'Admin)
export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        // Sécurité : On vérifie que c'est bien toi le chef !
        const user = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } });
        if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

        const { action } = await req.json();

        if (action === "STOP") {
            await prisma.globalEvent.deleteMany({ where: { id: "CURRENT_EVENT" } });
            return NextResponse.json({ success: true, message: "Alerte levée." });
        }

        if (action === "START") {
            const newEvent = getRandomEvent();
            // On fixe la fin de l'alerte à dans 24 heures
            const expiresAt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); 

            await prisma.globalEvent.upsert({
                where: { id: "CURRENT_EVENT" },
                update: { type: newEvent.type, message: newEvent.message, expiresAt },
                create: { id: "CURRENT_EVENT", type: newEvent.type, message: newEvent.message, expiresAt }
            });

            return NextResponse.json({ success: true, event: newEvent });
        }

        return NextResponse.json({ error: "Commande inconnue" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: "Erreur de transmission." }, { status: 500 });
    }
}