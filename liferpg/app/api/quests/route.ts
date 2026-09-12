import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DIFFICULTY_XP } from "@/lib/xp";

const CreateQuestSchema = z.object({
  title: z.string().trim().min(1, "A quest needs a title.").max(120),
  notes: z.string().trim().max(500).optional(),
  category: z.enum(["INTELLECT", "STRENGTH", "DISCIPLINE", "AGILITY", "WISDOM"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "BOSS"]),
  dueDate: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const quests = await prisma.quest.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ quests });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateQuestSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid quest.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { title, notes, category, difficulty, dueDate } = parsed.data;
    const reward = DIFFICULTY_XP[difficulty];

    const quest = await prisma.quest.create({
      data: {
        userId: session.user.id,
        title,
        notes: notes || null,
        category,
        difficulty,
        xpReward: reward.xp,
        goldReward: reward.gold,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ quest }, { status: 201 });
  } catch (err) {
    console.error("Quest creation failed:", err);
    return NextResponse.json({ error: "Could not create quest. Please try again." }, { status: 500 });
  }
}
