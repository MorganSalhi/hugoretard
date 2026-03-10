// app/api/profile/name/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name } = await req.json();
    
    // Petite vérification pour éviter les noms vides
    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: "Le pseudo doit faire au moins 3 caractères" }, { status: 400 });
    }

    // Mise à jour en base de données
    await prisma.user.update({
      where: { email: session.user.email },
      data: { name: name.trim() }
    });

    return NextResponse.json({ success: true, name: name.trim() });
  } catch (error) {
    console.error("Erreur modification nom:", error);
    return NextResponse.json({ error: "Erreur serveur IGPN" }, { status: 500 });
  }
}