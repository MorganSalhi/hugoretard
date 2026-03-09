// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// 1. RÉCUPÉRER LA LISTE DES AGENTS (Méthode GET)
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

// 2. CRÉER UN NOUVEL AGENT (Méthode POST)
export async function POST(req: Request) {
  try {
    const { name, email, initialBalance, password, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password || "hugo123", 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        walletBalance: Number(initialBalance) || 1000, // Conversion forcée en nombre
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

// 3. INJECTER DES FONDS À UN AGENT (Méthode PATCH - Celle qui te manquait !)
export async function PATCH(req: Request) {
  try {
    const { userId, amount } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json({ error: "Données invalides (ID ou montant manquant)" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: Number(amount) // On incrémente le solde du montant spécifié
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Erreur Prisma PATCH:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajout des fonds" }, { status: 500 });
  }
}