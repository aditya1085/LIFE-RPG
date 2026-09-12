import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-grain">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="flex items-center gap-2 text-brass-light">
          <span className="text-2xl">🕯️</span>
          <span className="font-display italic text-lg">Ledger &amp; Blade</span>
        </div>

        <h1 className="mt-10 font-display text-4xl sm:text-6xl leading-[1.05] text-parchment-100 max-w-3xl">
          Your to-do list, rewritten as a quest board.
        </h1>
        <p className="mt-6 max-w-xl text-parchment-300/90 text-lg leading-relaxed">
          Pin a real chore to the board and it becomes a quest. Finish it, and your
          character earns experience, gold, and a stat that actually grows —
          Intellect from study, Strength from the gym, Discipline from the boring stuff
          nobody wants to do.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="rounded-sm bg-seal px-6 py-3 font-semibold text-parchment-100 shadow-pin hover:bg-seal-light transition-colors"
          >
            Begin your ledger
          </Link>
          <Link
            href="/login"
            className="rounded-sm border border-brass/60 px-6 py-3 font-semibold text-brass-light hover:bg-ink-800 transition-colors"
          >
            I already have a character
          </Link>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            title="Quests, not tasks"
            body="Every quest carries a difficulty, an attribute, and a reward — nothing goes on the board without a reason to finish it."
          />
          <FeatureCard
            title="A streak that remembers you"
            body="Consecutive days of activity build a streak bonus on your XP, so showing up two days in a row is worth more than one big push."
          />
          <FeatureCard
            title="A Trading Post that spends your gold"
            body="Gold earned from quests buys cosmetic badges and ledger themes — a reason to keep the streak alive after the habit itself sticks."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="ledger-card p-6">
      <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-800/80">{body}</p>
    </div>
  );
}
