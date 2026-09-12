"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import QuestCard from "./QuestCard";
import NewQuestForm from "./NewQuestForm";
import type { QuestData, Category, Difficulty } from "@/lib/types";

type Filter = "active" | "completed" | "all";

interface Props {
  quests: QuestData[];
  onQuestsChange: (updater: (prev: QuestData[]) => QuestData[]) => void;
  onCompleteQuest: (id: string) => Promise<void>;
}

export default function QuestBoard({ quests, onQuestsChange, onCompleteQuest }: Props) {
  const [filter, setFilter] = useState<Filter>("active");
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    if (filter === "active") return quests.filter((q) => q.status !== "completed");
    if (filter === "completed") return quests.filter((q) => q.status === "completed");
    return quests;
  }, [quests, filter]);

  async function handleCreate(data: {
    title: string;
    notes?: string;
    category: Category;
    difficulty: Difficulty;
    dueDate?: string | null;
  }) {
    const tempId = `temp-${Date.now()}`;
    const optimistic: QuestData = {
      id: tempId,
      userId: "",
      title: data.title,
      notes: data.notes ?? null,
      category: data.category,
      difficulty: data.difficulty,
      xpReward: 0,
      goldReward: 0,
      status: "pending",
      dueDate: data.dueDate ?? null,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };

    onQuestsChange((prev) => [optimistic, ...prev]);
    setPendingIds((prev) => new Set(prev).add(tempId));

    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();

      if (!res.ok) {
        onQuestsChange((prev) => prev.filter((q) => q.id !== tempId));
        throw new Error(body.error || "Could not pin that quest.");
      }

      onQuestsChange((prev) => prev.map((q) => (q.id === tempId ? body.quest : q)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Check your connection.");
      throw err;
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }
  }

  async function handleDelete(id: string) {
    const snapshot = quests;
    onQuestsChange((prev) => prev.filter((q) => q.id !== id));

    try {
      const res = await fetch(`/api/quests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete that quest.");
    } catch (err) {
      onQuestsChange(() => snapshot); // roll back on network / server failure
      setError("Could not delete that quest — your connection may have dropped.");
    }
  }

  return (
    <section aria-label="Quest board" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl">The Quest Board</h2>
        <div role="tablist" aria-label="Filter quests" className="flex gap-1 bg-ink-800 rounded-sm p-1">
          {(["active", "completed", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-sm capitalize transition-colors ${
                filter === f ? "bg-brass text-ink-900 font-semibold" : "text-parchment-300 hover:bg-ink-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-seal-light bg-seal-dark/10 border border-seal-dark/40 rounded-sm px-3 py-2">
          {error}{" "}
          <button className="underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}

      <NewQuestForm onCreate={handleCreate} />

      {visible.length === 0 ? (
        <p className="text-sm text-parchment-300/70 py-8 text-center border border-dashed border-brass-dark/30 rounded-sm">
          {filter === "completed"
            ? "No quests completed yet — finish one and it'll land here."
            : "The board is empty. Pin your first quest above."}
        </p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                pending={pendingIds.has(quest.id)}
                onComplete={onCompleteQuest}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
