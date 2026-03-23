// app/api/brigades/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { 
                brigade: {
                    include: { members: true } // On récupère aussi les collègues de la brigade !
                } 
            }
        });

        if (!user) return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });

        // Si le joueur n'a pas de brigade, on lui envoie la liste de TOUTES les brigades existantes pour qu'il choisisse
        let allBrigades: any[] = [];
        if (!user.brigadeId) {
            allBrigades = await prisma.brigade.findMany({ 
                include: { _count: { select: { members: true } } } 
            });
        }

        return NextResponse.json({ 
            brigade: user.brigade, 
            availableBrigades: allBrigades 
        });

    } catch (error) {
        return NextResponse.json({ error: "Erreur des serveurs de renseignement." }, { status: 500 });
    }
}