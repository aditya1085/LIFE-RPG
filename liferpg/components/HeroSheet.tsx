"use client";

import { motion } from "framer-motion";
import XPBar from "./XPBar";
import { xpRequiredForLevel } from "@/lib/xp";
import type { UserData } from "@/lib/types";

const ATTRIBUTES: { key: keyof UserData; label: string; icon: string }[] = [
  { key: "intellect", label: "Intellect", icon: "📖" },
  { key: "strength", label: "Strength", icon: "💪" },
  { key: "discipline", label: "Discipline", icon: "⏳" },
  { key: "agility", label: "Agility", icon: "🏃" },
  { key: "wisdom", label: "Wisdom", icon: "🦉" },
];

export default function HeroSheet({ user }: { user: UserData }) {
  const xpToNext = xpRequiredForLevel(user.level);

  return (
    <aside className="ledger-card p-6 sticky top-6" aria-label="Hero sheet">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-ink-900 border-2 border-brass flex items-center justify-center text-2xl">
          🗡️
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight">{user.name}</h2>
          <p className="text-sm text-ink-800/70">Level {user.level} Adventurer</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-ink-900">
          <XPBar currentXp={user.currentXp} xpToNextLevel={xpToNext} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-sm bg-ink-900/5 border border-brass-dark/20 px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true">🪙</span> Gold
        </span>
        <motion.span
          key={user.gold}
          initial={{ scale: 1.3, color: "#A6321E" }}
          animate={{ scale: 1, color: "#1B1712" }}
          transition={{ duration: 0.4 }}
          className="font-display font-semibold tabular-nums"
        >
          {user.gold}
        </motion.span>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-sm bg-ink-900/5 border border-brass-dark/20 px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true">🔥</span> Streak
        </span>
        <span className="font-display font-semibold tabular-nums">
          {user.streakCount} day{user.streakCount === 1 ? "" : "s"}
        </span>
      </div>

      <h3 className="mt-6 mb-3 text-xs uppercase tracking-wide text-ink-800/60 font-semibold">
        Attributes
      </h3>
      <ul className="space-y-2">
        {ATTRIBUTES.map((attr) => (
          <li key={attr.key} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{attr.icon}</span> {attr.label}
            </span>
            <span className="font-display font-semibold tabular-nums">{user[attr.key] as number}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
