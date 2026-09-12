"use client";

import { motion } from "framer-motion";

export default function XPBar({ currentXp, xpToNextLevel }: { currentXp: number; xpToNextLevel: number }) {
  const pct = Math.min(100, Math.round((currentXp / xpToNextLevel) * 100));

  return (
    <div>
      <div className="flex justify-between text-xs text-parchment-300/80 mb-1">
        <span>Experience</span>
        <span aria-hidden="true">
          {currentXp} / {xpToNextLevel}
        </span>
      </div>
      <div
        className="h-3 w-full rounded-full bg-ink-700 overflow-hidden border border-brass-dark/40"
        role="progressbar"
        aria-valuenow={currentXp}
        aria-valuemin={0}
        aria-valuemax={xpToNextLevel}
        aria-label="Experience toward next level"
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brass-dark via-brass to-brass-light"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
      </div>
    </div>
  );
}
