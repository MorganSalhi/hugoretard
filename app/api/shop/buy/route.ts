// app/api/shop/buy/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { SHOP_ITEMS, type ItemType } from "@/lib/items"; // Ajout du type ici
import { updateMissionProgress } from "@/lib/missions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { itemType } = (await req.json()) as { itemType: ItemType };
    const item = SHOP_ITEMS[itemType];

    if (!item) return NextResponse.json({ error: "Équipement non répertorié" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.walletBalance < item.price) {
      return NextResponse.json({ error: "Fonds de saisie insuffisants" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: item.price } }
      }),
      prisma.userItem.upsert({
        where: { userId_itemType: { userId: user.id, itemType } },
        update: { quantity: { increment: 1 } },
        create: { userId: user.id, itemType, quantity: 1 }
      })
    ]);
    await updateMissionProgress(user.id, "BUY_SHOP");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la transaction" }, { status: 500 });
  }
}