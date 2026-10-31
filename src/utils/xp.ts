export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  progress: number;
  totalXp: number;
}

function requirementFor(level: number): number {
  return 100 + (level - 1) * 50;
}

export function levelInfo(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  let requirement = requirementFor(level);

  while (remaining >= requirement) {
    remaining -= requirement;
    level += 1;
    requirement = requirementFor(level);
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpForNext: requirement,
    progress: requirement === 0 ? 0 : remaining / requirement,
    totalXp: Math.max(0, totalXp),
  };
}
