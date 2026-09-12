import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const [items, purchases] = await Promise.all([
    prisma.shopItem.findMany({ orderBy: { cost: "asc" } }),
    prisma.purchase.findMany({ where: { userId: session.user.id }, select: { itemId: true } }),
  ]);

  const ownedIds = new Set(purchases.map((p) => p.itemId));
  return NextResponse.json({
    items: items.map((item) => ({ ...item, owned: ownedIds.has(item.id) })),
  });
}
