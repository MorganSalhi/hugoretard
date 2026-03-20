// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const HARDCORE_TITLES = [
  "Le Gazeur de Femmes Enceintes", "L'Écraseur de Têtes", "L'Éborgneur au LBD",
  "Le Boucher de la GAV", "L'As du Plaquage Ventral", "Le Dégoupilleur Compulsif",
  "Le Falsificateur de Preuves", "Le Spécialiste du Tir Tendu", "Le Briseur de Mâchoires",
  "Le Tortionnaire en Cellule", "L'Amateur de Clés d'Étranglement", "Le Voleur de Scellés",
  "Le Roi de la Tabassée Gratuite", "Le Collectionneur de Dents", "Le Nettoyeur de Bavures",
  "Le Maître du Faux Témoignage", "L'Artiste du Coup de Tonfa", "Le Couvreur d'Assassinats",
  "Le Broyeur de Rotules", "L'Insatiable de la Gâchette"
];

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "Données invalides ou mot de passe trop court (6 min)." }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Cet agent est déjà fiché à l'IGPN." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const randomTitle = HARDCORE_TITLES[Math.floor(Math.random() * HARDCORE_TITLES.length)];

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        title: randomTitle,
        walletBalance: 1000, // Budget de départ
        role: "USER"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur lors de l'enrôlement." }, { status: 500 });
  }
}