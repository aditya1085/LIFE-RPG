"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ShopItemData } from "@/lib/types";

interface Props {
  items: ShopItemData[];
  gold: number;
  onPurchase: (itemId: string, cost: number) => Promise<void>;
}

export default function Shop({ items, gold, onPurchase }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  async function handleBuy(item: ShopItemData) {
    setError(null);
    if (gold < item.cost) {
      setError("Not enough gold — finish a few more quests first.");
      return;
    }
    setBuyingId(item.id);
    try {
      await onPurchase(item.id, item.cost);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed. Try again.");
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <section aria-label="Trading Post" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">The Trading Post</h2>
        <span className="text-sm text-parchment-300/80">🪙 {gold} gold on hand</span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-seal-light bg-seal-dark/10 border border-seal-dark/40 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const affordable = gold >= item.cost;
          return (
            <motion.div key={item.id} layout className="ledger-card p-4 flex flex-col">
              <div className="flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <h3 className="font-display font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-ink-800/70">{item.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold">🪙 {item.cost}</span>
                {item.owned ? (
                  <span className="text-xs font-medium text-moss px-2 py-1 rounded-sm bg-moss/10 border border-moss/40">
                    Owned
                  </span>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!affordable || buyingId === item.id}
                    className="rounded-sm bg-seal px-3 py-1.5 text-sm font-semibold text-parchment-100 hover:bg-seal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {buyingId === item.id ? "Buying…" : affordable ? "Buy" : "Too costly"}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
