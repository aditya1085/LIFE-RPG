"use client";

import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import HeroSheet from "@/components/HeroSheet";
import QuestBoard from "@/components/QuestBoard";
import Shop from "@/components/Shop";
import LevelUpModal from "@/components/LevelUpModal";
import StreakBadge from "@/components/StreakBadge";
import type { QuestData, UserData, ShopItemData } from "@/lib/types";

type Tab = "quests" | "shop";

export default function DashboardClient({
  initialUser,
  initialQuests,
  initialShop,
}: {
  initialUser: UserData;
  initialQuests: QuestData[];
  initialShop: ShopItemData[];
}) {
  const [user, setUser] = useState(initialUser);
  const [quests, setQuests] = useState(initialQuests);
  const [shop, setShop] = useState(initialShop);
  const [tab, setTab] = useState<Tab>("quests");
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleCompleteQuest = useCallback(async (id: string) => {
    // Optimistic UI: mark complete immediately, roll back if the server disagrees.
    const snapshot = quests;
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "completed", completedAt: new Date().toISOString() } : q))
    );

    try {
      const res = await fetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      const body = await res.json();

      if (!res.ok) {
        setQuests(snapshot);
        setGlobalError(body.error || "Could not complete that quest.");
        return;
      }

      setUser(body.user);
      if (body.leveledUp) setLevelUpTo(body.user.level);
    } catch (err) {
      setQuests(snapshot);
      setGlobalError("Your connection dropped — that quest wasn't saved as complete. Try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quests]);

  const handlePurchase = useCallback(
    async (itemId: string, cost: number) => {
      const snapshotUser = user;
      const snapshotShop = shop;
      setUser((u) => ({ ...u, gold: u.gold - cost }));
      setShop((items) => items.map((i) => (i.id === itemId ? { ...i, owned: true } : i)));

      try {
        const res = await fetch("/api/shop/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        });
        const body = await res.json();

        if (!res.ok) {
          setUser(snapshotUser);
          setShop(snapshotShop);
          throw new Error(body.error || "Purchase failed.");
        }
        setUser(body.user);
      } catch (err) {
        setUser(snapshotUser);
        setShop(snapshotShop);
        throw err;
      }
    },
    [user, shop]
  );

  return (
    <div className="min-h-screen bg-grain">
      <header className="border-b border-brass-dark/20 px-6 py-4 flex items-center justify-between">
        <span className="font-display italic text-brass-light">🕯️ Ledger &amp; Blade</span>
        <div className="flex items-center gap-4">
          <StreakBadge count={user.streakCount} />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-parchment-300/80 hover:text-parchment-100"
          >
            Log out
          </button>
        </div>
      </header>

      {globalError && (
        <div className="max-w-5xl mx-auto px-6 pt-4">
          <p role="alert" className="text-sm text-seal-light bg-seal-dark/10 border border-seal-dark/40 rounded-sm px-3 py-2">
            {globalError}{" "}
            <button className="underline" onClick={() => setGlobalError(null)}>
              Dismiss
            </button>
          </p>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8 grid gap-8 md:grid-cols-[280px_1fr]">
        <HeroSheet user={user} />

        <div>
          <div role="tablist" aria-label="Dashboard sections" className="flex gap-1 bg-ink-800 rounded-sm p-1 w-fit mb-6">
            <button
              role="tab"
              aria-selected={tab === "quests"}
              onClick={() => setTab("quests")}
              className={`px-4 py-1.5 text-sm rounded-sm font-medium transition-colors ${
                tab === "quests" ? "bg-brass text-ink-900" : "text-parchment-300 hover:bg-ink-700"
              }`}
            >
              Quest Board
            </button>
            <button
              role="tab"
              aria-selected={tab === "shop"}
              onClick={() => setTab("shop")}
              className={`px-4 py-1.5 text-sm rounded-sm font-medium transition-colors ${
                tab === "shop" ? "bg-brass text-ink-900" : "text-parchment-300 hover:bg-ink-700"
              }`}
            >
              Trading Post
            </button>
          </div>

          {tab === "quests" ? (
            <QuestBoard quests={quests} onQuestsChange={setQuests} onCompleteQuest={handleCompleteQuest} />
          ) : (
            <Shop items={shop} gold={user.gold} onPurchase={handlePurchase} />
          )}
        </div>
      </main>

      <LevelUpModal level={levelUpTo} onClose={() => setLevelUpTo(null)} />
    </div>
  );
}
