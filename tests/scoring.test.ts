import { describe, expect, it } from 'vitest'
import {
  computeScore,
  MAX_ACCURACY_BONUS,
  POINTS_PER_MATCH,
} from '@/app/(app)/game/scoring'

describe('computeScore', () => {
  it('kasus normal: 6 benar dari 8 percobaan, selesai', () => {
    const { score, accuracy, bonus } = computeScore(6, 8, true)
    expect(accuracy).toBeCloseTo(0.75)
    expect(bonus).toBe(75)
    expect(score).toBe(6 * POINTS_PER_MATCH + 75) // 675
  })

  it('akurasi sempurna: bonus penuh', () => {
    const { score, accuracy, bonus } = computeScore(7, 7, true)
    expect(accuracy).toBe(1)
    expect(bonus).toBe(MAX_ACCURACY_BONUS)
    expect(score).toBe(7 * POINTS_PER_MATCH + MAX_ACCURACY_BONUS) // 800
  })

  it('tidak selesai: tanpa bonus meski akurasi tinggi', () => {
    const { score, bonus } = computeScore(3, 3, false)
    expect(bonus).toBe(0)
    expect(score).toBe(3 * POINTS_PER_MATCH)
  })

  it('nol benar, nol percobaan: skor 0 dan tidak dibagi nol', () => {
    const { score, accuracy, bonus } = computeScore(0, 0, false)
    expect(score).toBe(0)
    expect(accuracy).toBe(0)
    expect(bonus).toBe(0)
  })

  it('bonus dibulatkan dari akurasi', () => {
    // 5/7 = 0.714… → bonus 71
    const { bonus } = computeScore(5, 7, true)
    expect(bonus).toBe(71)
  })
})
