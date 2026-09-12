"use client";

import { useState, FormEvent } from "react";
import type { Category, Difficulty } from "@/lib/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "DISCIPLINE", label: "Discipline" },
  { value: "INTELLECT", label: "Intellect" },
  { value: "STRENGTH", label: "Strength" },
  { value: "AGILITY", label: "Agility" },
  { value: "WISDOM", label: "Wisdom" },
];

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: "EASY", label: "Easy", hint: "15 XP · 5g" },
  { value: "MEDIUM", label: "Medium", hint: "35 XP · 12g" },
  { value: "HARD", label: "Hard", hint: "70 XP · 25g" },
  { value: "BOSS", label: "Boss", hint: "150 XP · 60g" },
];

interface Props {
  onCreate: (data: {
    title: string;
    notes?: string;
    category: Category;
    difficulty: Difficulty;
    dueDate?: string | null;
  }) => Promise<void>;
}

export default function NewQuestForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<Category>("DISCIPLINE");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("A quest needs a title before it can go on the board.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        title: trimmed,
        notes: notes.trim() || undefined,
        category,
        difficulty,
        dueDate: dueDate || null,
      });
      setTitle("");
      setNotes("");
      setDueDate("");
      setDifficulty("EASY");
      setCategory("DISCIPLINE");
      setOpen(false);
    } catch (err: any) {
      setError(err?.message || "Could not post that quest. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-sm border-2 border-dashed border-brass-dark/50 py-3 text-sm font-medium text-brass-light hover:border-brass hover:bg-ink-800/60 transition-colors"
      >
        + Pin a new quest to the board
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="ledger-card p-5 space-y-4" noValidate>
      <div>
        <label htmlFor="quest-title" className="block text-sm font-medium mb-1">
          Quest title
        </label>
        <input
          id="quest-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Read 20 pages"
          className="w-full rounded-sm border border-ink-900/20 bg-parchment-100 px-3 py-2 text-ink-900 focus:border-seal outline-none"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="quest-notes" className="block text-sm font-medium mb-1">
          Notes <span className="text-ink-800/50 font-normal">(optional)</span>
        </label>
        <textarea
          id="quest-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-sm border border-ink-900/20 bg-parchment-100 px-3 py-2 text-ink-900 focus:border-seal outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="quest-category" className="block text-sm font-medium mb-1">
            Attribute
          </label>
          <select
            id="quest-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-sm border border-ink-900/20 bg-parchment-100 px-3 py-2 text-ink-900 focus:border-seal outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quest-difficulty" className="block text-sm font-medium mb-1">
            Difficulty
          </label>
          <select
            id="quest-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full rounded-sm border border-ink-900/20 bg-parchment-100 px-3 py-2 text-ink-900 focus:border-seal outline-none"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label} — {d.hint}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="quest-due" className="block text-sm font-medium mb-1">
          Due date <span className="text-ink-800/50 font-normal">(optional)</span>
        </label>
        <input
          id="quest-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-sm border border-ink-900/20 bg-parchment-100 px-3 py-2 text-ink-900 focus:border-seal outline-none"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-seal bg-seal/10 border border-seal/40 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-seal px-4 py-2 text-sm font-semibold text-parchment-100 hover:bg-seal-light transition-colors disabled:opacity-60"
        >
          {submitting ? "Pinning…" : "Pin quest"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-sm px-4 py-2 text-sm font-medium text-ink-800/70 hover:bg-ink-900/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
