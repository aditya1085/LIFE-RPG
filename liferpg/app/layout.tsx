import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ledger & Blade — Turn your life into a quest log",
  description:
    "A tavern quest-board for your real life. Track habits and tasks as quests, level up your character, and spend gold at the Trading Post.",
  keywords: ["habit tracker", "life rpg", "gamified productivity", "quest log", "task rpg"],
  openGraph: {
    title: "Ledger & Blade",
    description: "Turn your to-do list into a quest log worth completing.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
