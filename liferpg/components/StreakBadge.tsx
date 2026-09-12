export default function StreakBadge({ count }: { count: number }) {
  if (count < 2) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-seal/10 border border-seal/40 px-2 py-0.5 text-xs font-medium text-seal-dark">
      🔥 {count}-day streak bonus
    </span>
  );
}
