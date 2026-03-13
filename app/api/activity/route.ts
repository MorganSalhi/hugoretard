// app/api/activity/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.bet.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        // 1. AJOUT DE "title: true" POUR RÉCUPÉRER LE TITRE EN BDD
        user: { select: { name: true, title: true } },
        course: { select: { subject: true } }
      }
    });

    // On formate les données pour le flux en typant 'bet'
    const formattedActivity = activities.map((bet: any) => ({
      id: bet.id,
      user: bet.user?.name || "Anonyme",
      // 2. ON AJOUTE LE TITRE DANS LES DONNÉES ENVOYÉES
      userTitle: bet.user?.title || "L'Adjoint",
      subject: bet.course?.subject || "Sujet inconnu",
      amount: bet.amount,
      type: bet.pointsEarned && bet.pointsEarned > 0 ? "WIN" : "BET",
      time: bet.createdAt
    }));

    return NextResponse.json(formattedActivity);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de flux" }, { status: 500 });
  }
}