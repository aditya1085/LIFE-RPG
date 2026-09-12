import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyXpGain, computeStreak, CATEGORY_FIELD } from "@/lib/xp";

const PatchSchema = z.object({
  action: z.enum(["complete", "reopen"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Ownership check: users may only ever touch their own quests.
    const quest = await prisma.quest.findUnique({ where: { id: params.id } });
    if (!quest || quest.userId !== session.user.id) {
      return NextResponse.json({ error: "Quest not found." }, { status: 404 });
    }

    if (parsed.data.action === "reopen") {
      const updated = await prisma.quest.update({
        where: { id: quest.id },
        data: { status: "pending", completedAt: null },
      });
      return NextResponse.json({ quest: updated });
    }

    if (quest.status === "completed") {
      return NextResponse.json({ error: "Quest already completed." }, { status: 409 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const { streakCount, longestStreak, streakBonus } = computeStreak(
      user.lastActiveOn,
      user.streakCount,
      user.longestStreak
    );

    const adjustedXp = Math.round(quest.xpReward * streakBonus);
    const levelState = applyXpGain(user.level, user.currentXp, adjustedXp);
    const attributeField = CATEGORY_FIELD[quest.category];

    const [, updatedUser] = await prisma.$transaction([
      prisma.quest.update({
        where: { id: quest.id },
        data: { status: "completed", completedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          level: levelState.level,
          currentXp: levelState.currentXp,
          gold: { increment: quest.goldReward },
          streakCount,
          longestStreak,
          lastActiveOn: new Date(),
          [attributeField]: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      user: updatedUser,
      xpGained: adjustedXp,
      streakBonusApplied: streakBonus > 1,
      leveledUp: levelState.leveledUp,
      levelsGained: levelState.levelsGained,
    });
  } catch (err) {
    console.error("Quest completion failed:", err);
    return NextResponse.json({ error: "Could not complete quest. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const quest = await prisma.quest.findUnique({ where: { id: params.id } });
  if (!quest || quest.userId !== session.user.id) {
    return NextResponse.json({ error: "Quest not found." }, { status: 404 });
  }

  await prisma.quest.delete({ where: { id: quest.id } });
  return NextResponse.json({ ok: true });
}
