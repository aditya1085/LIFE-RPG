"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { QuestData } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/xp";

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: "bg-moss/15 text-moss border-moss/40",
  MEDIUM: "bg-brass/15 text-brass-dark border-brass/40",
  HARD: "bg-seal/15 text-seal-dark border-seal/40",
  BOSS: "bg-ink-900 text-brass-light border-brass",
};

interface Props {
  quest: QuestData;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  pending?: boolean;
}

export default function QuestCard({ quest, onComplete, onDelete, pending }: Props) {
  const [busy, setBusy] = useState(false);
  const isCompleted = quest.status === "completed";
  const isOverdue = !isCompleted && quest.dueDate && new Date(quest.dueDate) < new Date();

  async function handleComplete() {
    setBusy(true);
    try {
      await onComplete(quest.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await onDelete(quest.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: pending ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      className={`ledger-card p-4 flex items-start gap-3 ${isCompleted ? "opacity-60" : ""}`}
    >
      <button
        onClick={handleComplete}
        disabled={busy || isCompleted}
        aria-label={isCompleted ? `${quest.title} completed` : `Mark ${quest.title} as complete`}
        className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
          isCompleted
            ? "bg-moss border-moss text-parchment-100"
            : "border-ink-900/30 hover:border-seal disabled:opacity-50"
        }`}
      >
        {isCompleted ? "✓" : ""}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={`font-display font-semibold ${isCompleted ? "line-through text-ink-800/50" : ""}`}>
            {quest.title}
          </h4>
          <span className={`text-[11px] px-1.5 py-0.5 rounded-sm border font-medium ${DIFFICULTY_STYLE[quest.difficulty]}`}>
            {quest.difficulty}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-sm border border-ink-900/20 text-ink-800/70">
            {CATEGORY_LABEL[quest.category]}
          </span>
          {isOverdue && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-seal/15 text-seal-dark border border-seal/40">
              Overdue
            </span>
          )}
        </div>

        {quest.notes && <p className="mt-1 text-sm text-ink-800/70">{quest.notes}</p>}

        <div className="mt-2 flex items-center gap-3 text-xs text-ink-800/60">
          <span>+{quest.xpReward} XP</span>
          <span>+{quest.goldReward}g</span>
          {quest.dueDate && <span>Due {new Date(quest.dueDate).toLocaleDateString()}</span>}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={busy}
        aria-label={`Delete ${quest.title}`}
        className="text-ink-800/40 hover:text-seal transition-colors px-1 disabled:opacity-40"
      >
        ✕
      </button>
    </motion.li>
  );
}
