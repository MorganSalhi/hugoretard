// app/api/profile/image/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { image } = await req.json();
    if (!image) {
        return NextResponse.json({ error: "Aucune image reçue" }, { status: 400 });
    }

    // Mise à jour de l'image de l'agent
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur upload image:", error);
    return NextResponse.json({ error: "Erreur serveur IGPN" }, { status: 500 });
  }
}