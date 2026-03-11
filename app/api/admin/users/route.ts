// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// TRÈS IMPORTANT : Désactive le cache pour cette route admin
export const dynamic = 'force-dynamic';

// 1. RÉCUPÉRER LA LISTE DES AGENTS
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { walletBalance: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Erreur Prisma GET:", error);
    return NextResponse.json({ error: "Impossible de récupérer les agents" }, { status: 500 });
  }
}

// 2. CRÉER UN NOUVEL AGENT
export async function POST(req: Request) {
  try {
    const { name, email, initialBalance, password, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password || "hugo123", 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        walletBalance: Number(initialBalance) || 1000,
        password: hashedPassword,
        role: role || "USER",
      },
    });
    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error("Erreur Prisma POST:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// 3. INJECTER DES FONDS À UN AGENT
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, amount } = body;

    // SÉCURITÉ : Vérification ultra-stricte + Message d'erreur détaillé
    if (!userId || amount === undefined || amount === null || isNaN(Number(amount))) {
      return NextResponse.json({
        error: `Bavure de transfert. Reçu -> ID: ${userId || "VIDE"}, Montant: ${amount || "VIDE"}`
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: Number(amount) // On force la conversion en nombre
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Erreur Prisma PATCH:", error);
    return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
  }
}