import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const [quests, shopItems, purchases] = await Promise.all([
    prisma.quest.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.shopItem.findMany({ orderBy: { cost: "asc" } }),
    prisma.purchase.findMany({ where: { userId: user.id }, select: { itemId: true } }),
  ]);

  const ownedIds = new Set(purchases.map((p) => p.itemId));
  const shop = shopItems.map((item) => ({ ...item, owned: ownedIds.has(item.id) }));

  // Serialize dates for the client component.
  const serializedUser = {
    ...user,
    lastActiveOn: user.lastActiveOn?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
  const serializedQuests = quests.map((q) => ({
    ...q,
    dueDate: q.dueDate?.toISOString() ?? null,
    completedAt: q.completedAt?.toISOString() ?? null,
    createdAt: q.createdAt.toISOString(),
  }));

  return <DashboardClient initialUser={serializedUser} initialQuests={serializedQuests} initialShop={shop} />;
}
