// app/api/activity/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.bet.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        // 1. On ajoute "title: true" ici
        user: { select: { name: true, title: true } },
        course: { select: { subject: true } }
      }
    });

    const formattedActivity = activities.map((bet: any) => ({
      id: bet.id,
      user: bet.user?.name || "Anonyme",
      // 2. On ajoute le userTitle ici (s'il n'en a pas, on met "L'Adjoint" par défaut)
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