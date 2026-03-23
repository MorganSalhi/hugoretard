import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateMissionProgress } from "@/lib/missions";

// 1. GET : Récupérer les infos de l'agent connecté (Solde, Grade)
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      // AJOUTE CE BLOC ICI :
      include: {
        items: true, // On demande à Prisma d'inclure les objets de l'inventaire
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 });
  }
}

// 2. POST : Enregistrer un nouveau pari pour l'agent connecté
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { courseId, time, amount, appliedItem } = await req.json(); // On récupère appliedItem
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email },
      include: { items: true } 
    });

    if (!user) return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    if (user.walletBalance < amount) return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });

    // Vérification de l'objet si utilisé
    if (appliedItem) {
      const inventoryItem = user.items.find((i: any) => i.itemType === appliedItem);
      if (!inventoryItem || inventoryItem.quantity <= 0) {
        return NextResponse.json({ error: "Objet non disponible dans votre arsenal" }, { status: 400 });
      }
    }

    const [hours, minutes] = time.split(":").map(Number);
    const guessedDate = new Date();
    guessedDate.setHours(hours, minutes, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Déduire le solde
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: amount } },
      });

      // 2. Consommer l'objet si utilisé
      if (appliedItem) {
        await tx.userItem.update({
          where: { userId_itemType: { userId: user.id, itemType: appliedItem } },
          data: { quantity: { decrement: 1 } },
        });
      }

      // 3. Créer le pari avec l'objet lié
      return await tx.bet.create({
        data: {
          userId: user.id,
          courseId,
          guessedTime: guessedDate,
          amount,
          appliedItem, // On enregistre l'équipement utilisé
        },
      });
    });
    await updateMissionProgress(user.id, "PLACE_BETS");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du pari" }, { status: 500 });
  }
}