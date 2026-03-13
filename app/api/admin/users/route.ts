// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const dynamic = 'force-dynamic';

// LA LISTE NOIRE DE L'IGPN
const HARDCORE_TITLES = [
  "Le Gazeur de Femmes Enceintes", "L'Écraseur de Têtes", "L'Éborgneur au LBD",
  "Le Boucher de la GAV", "L'As du Plaquage Ventral", "Le Dégoupilleur Compulsif",
  "Le Falsificateur de Preuves", "Le Spécialiste du Tir Tendu", "Le Briseur de Mâchoires",
  "Le Tortionnaire en Cellule", "L'Amateur de Clés d'Étranglement", "Le Voleur de Scellés",
  "Le Roi de la Tabassée Gratuite", "Le Collectionneur de Dents", "Le Nettoyeur de Bavures",
  "Le Maître du Faux Témoignage", "L'Artiste du Coup de Tonfa", "Le Couvreur d'Assassinats",
  "Le Broyeur de Rotules", "L'Insatiable de la Gâchette"
];

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { walletBalance: 'desc' } });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, initialBalance, password, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password || "hugo123", 10);

    // Tirage au sort du titre de bavure
    const randomTitle = HARDCORE_TITLES[Math.floor(Math.random() * HARDCORE_TITLES.length)];

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        walletBalance: Number(initialBalance) || 1000,
        password: hashedPassword,
        role: role || "USER",
        title: randomTitle, // <--- SAUVEGARDE DU TITRE EN BDD
      },
    });
    return NextResponse.json(newUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// (Ta fonction PATCH existante pour l'argent reste inchangée ici)
export async function PATCH(req: Request) {
  try {
    const { email, amount } = await req.json();
    if (!email || isNaN(Number(amount))) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { walletBalance: { increment: Number(amount) } }
    });
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}