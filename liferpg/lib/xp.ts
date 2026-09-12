// The RPG Progression Engine
// Non-linear leveling: each level costs exponentially more XP than the last,
// so early levels feel fast and later levels feel earned.

const BASE_XP = 100;
const GROWTH_RATE = 1.42;

export function xpRequiredForLevel(level: number): number {
  // XP needed to go from `level` to `level + 1`
  return Math.floor(BASE_XP * Math.pow(GROWTH_RATE, level - 1));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpRequiredForLevel(l);
  return total;
}

export interface LevelState {
  level: number;
  currentXp: number; // xp accrued toward the *current* level
  xpToNextLevel: number;
  leveledUp: boolean;
  levelsGained: number;
}

/**
 * Applies an XP gain to a (level, currentXp) pair and rolls over any
 * level-ups, since a single big quest could span multiple levels.
 */
export function applyXpGain(level: number, currentXp: number, xpGained: number): LevelState {
  let newLevel = level;
  let remaining = currentXp + xpGained;
  let levelsGained = 0;

  let needed = xpRequiredForLevel(newLevel);
  while (remaining >= needed) {
    remaining -= needed;
    newLevel += 1;
    levelsGained += 1;
    needed = xpRequiredForLevel(newLevel);
  }

  return {
    level: newLevel,
    currentXp: remaining,
    xpToNextLevel: needed,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

export const DIFFICULTY_XP: Record<string, { xp: number; gold: number }> = {
  EASY: { xp: 15, gold: 5 },
  MEDIUM: { xp: 35, gold: 12 },
  HARD: { xp: 70, gold: 25 },
  BOSS: { xp: 150, gold: 60 },
};

export const CATEGORY_LABEL: Record<string, string> = {
  INTELLECT: "Intellect",
  STRENGTH: "Strength",
  DISCIPLINE: "Discipline",
  AGILITY: "Agility",
  WISDOM: "Wisdom",
};

export const CATEGORY_FIELD: Record<string, "intellect" | "strength" | "discipline" | "agility" | "wisdom"> = {
  INTELLECT: "intellect",
  STRENGTH: "strength",
  DISCIPLINE: "discipline",
  AGILITY: "agility",
  WISDOM: "wisdom",
};

/**
 * Streak logic: comparing calendar days (not 24h windows) so a quest
 * completed at 11pm and another at 7am the next day still counts.
 */
export function computeStreak(lastActiveOn: Date | null, streakCount: number, longestStreak: number, now: Date = new Date()) {
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  if (!lastActiveOn) {
    return { streakCount: 1, longestStreak: Math.max(1, longestStreak), streakBonus: 1 };
  }

  const diffDays = Math.round((startOfDay(now) - startOfDay(lastActiveOn)) / dayMs);

  let newStreak: number;
  if (diffDays === 0) {
    newStreak = streakCount; // already active today, streak unchanged
  } else if (diffDays === 1) {
    newStreak = streakCount + 1; // consecutive day
  } else {
    newStreak = 1; // streak broken, restart
  }

  const streakBonus = 1 + Math.min(newStreak * 0.05, 0.5); // up to +50% XP at a 10-day streak
  return { streakCount: newStreak, longestStreak: Math.max(newStreak, longestStreak), streakBonus };
}
