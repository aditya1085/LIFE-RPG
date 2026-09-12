"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function LevelUpModal({
  level,
  onClose,
}: {
  level: number | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (level === null) return;

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#C9A227", "#E0BE52", "#A6321E", "#F6EFDD"],
    });

    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [level, onClose]);

  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="status"
          aria-live="polite"
        >
          <motion.div
            className="ledger-card px-10 py-8 text-center max-w-sm"
            initial={{ scale: 0.7, y: 30, rotate: -3 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
          >
            <p className="text-sm uppercase tracking-wide text-seal font-semibold">Level Up</p>
            <p className="mt-2 font-display text-5xl font-bold text-ink-900">Lv. {level}</p>
            <p className="mt-3 text-sm text-ink-800/70">Your ledger grows heavier. Onward, adventurer.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
