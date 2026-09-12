"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Incorrect email or password." : res.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-grain">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-brass-light font-display italic text-lg">
          🕯️ Ledger &amp; Blade
        </Link>

        <h1 className="mt-8 font-display text-3xl text-parchment-100">Return to the tavern</h1>
        <p className="mt-2 text-sm text-parchment-300/80">Enter your credentials to resume your ledger.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm text-parchment-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm bg-ink-800 border border-brass-dark/50 px-4 py-2.5 text-parchment-100 focus:border-brass outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-parchment-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm bg-ink-800 border border-brass-dark/50 px-4 py-2.5 text-parchment-100 focus:border-brass outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-seal-light bg-seal-dark/10 border border-seal-dark/40 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-seal py-2.5 font-semibold text-parchment-100 shadow-pin hover:bg-seal-light transition-colors disabled:opacity-60"
          >
            {loading ? "Opening the ledger…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-parchment-300/80">
          New here?{" "}
          <Link href="/register" className="text-brass-light underline underline-offset-2">
            Create a character
          </Link>
        </p>
      </div>
    </main>
  );
}
