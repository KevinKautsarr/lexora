// Perhitungan level murni dari XP. level = floor(xp / 500) + 1.

export const XP_PER_LEVEL = 500

export function levelForXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1
}

/** Total XP yang dibutuhkan untuk mencapai level berikutnya. */
export function xpForNextLevel(xp: number): number {
  return levelForXp(xp) * XP_PER_LEVEL
}

/** Progres di dalam level saat ini, untuk progress bar. */
export function levelProgress(xp: number): {
  level: number
  xpInLevel: number
  xpNeeded: number
  fraction: number
} {
  const level = levelForXp(xp)
  const xpInLevel = Math.max(0, xp) - (level - 1) * XP_PER_LEVEL
  return { level, xpInLevel, xpNeeded: XP_PER_LEVEL, fraction: xpInLevel / XP_PER_LEVEL }
}
