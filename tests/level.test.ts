import { describe, expect, it } from 'vitest'
import { levelForXp, levelProgress, xpForNextLevel, XP_PER_LEVEL } from '@/lib/level'

describe('levelForXp', () => {
  it('batas-batas level: 0, 499, 500, 1463', () => {
    expect(levelForXp(0)).toBe(1)
    expect(levelForXp(499)).toBe(1)
    expect(levelForXp(500)).toBe(2)
    expect(levelForXp(1463)).toBe(3)
  })

  it('XP negatif tidak membuat level di bawah 1', () => {
    expect(levelForXp(-100)).toBe(1)
  })
})

describe('xpForNextLevel', () => {
  it('mengembalikan ambang total XP level berikutnya', () => {
    expect(xpForNextLevel(0)).toBe(XP_PER_LEVEL) // 500
    expect(xpForNextLevel(1463)).toBe(1500)
  })
})

describe('levelProgress', () => {
  it('menghitung posisi dalam level untuk progress bar', () => {
    const p = levelProgress(1463)
    expect(p.level).toBe(3)
    expect(p.xpInLevel).toBe(463)
    expect(p.xpNeeded).toBe(XP_PER_LEVEL)
    expect(p.fraction).toBeCloseTo(463 / 500)
  })
})
