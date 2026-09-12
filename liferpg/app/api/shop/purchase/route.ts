import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PurchaseSchema = z.object({ itemId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = PurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const item = await prisma.shopItem.findUnique({ where: { id: parsed.data.itemId } });
    if (!item) return NextResponse.json({ error: "That item doesn't exist." }, { status: 404 });

    const alreadyOwned = await prisma.purchase.findUnique({
      where: { userId_itemId: { userId: session.user.id, itemId: item.id } },
    });
    if (alreadyOwned) {
      return NextResponse.json({ error: "You already own this." }, { status: 409 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (user.gold < item.cost) {
      return NextResponse.json({ error: "Not enough gold for that." }, { status: 402 });
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { gold: { decrement: item.cost } },
      }),
      prisma.purchase.create({ data: { userId: user.id, itemId: item.id } }),
    ]);

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("Purchase failed:", err);
    return NextResponse.json({ error: "Purchase failed. Please try again." }, { status: 500 });
  }
}
