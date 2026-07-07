import { describe, expect, it } from 'vitest'
import { computeScore, MAX_LESSON_SCORE } from '@/app/(app)/game/scoring'

describe('computeScore', () => {
  // Lesson 8 kata × 2 repetisi = 16 pencocokan total.
  const TOTAL = 16

  it('kasus normal: 12 benar dari 16 percobaan, selesai', () => {
    const { score, accuracy, bonus } = computeScore(12, 16, TOTAL, true)
    expect(accuracy).toBeCloseTo(0.75)
    // matchPoints = round(12 * (45/16)) = round(33.75) = 34; bonus = round(0.75*5) = 4
    expect(bonus).toBe(4)
    expect(score).toBe(34 + 4)
  })

  it('akurasi sempurna: bonus penuh dan skor = MAX_LESSON_SCORE', () => {
    const { score, accuracy, bonus, matchPoints } = computeScore(TOTAL, TOTAL, TOTAL, true)
    expect(accuracy).toBe(1)
    expect(bonus).toBe(5)
    expect(matchPoints).toBe(45)
    expect(score).toBe(MAX_LESSON_SCORE)
  })

  it('tidak selesai: tanpa bonus meski akurasi tinggi', () => {
    const { bonus, matchPoints } = computeScore(6, 6, TOTAL, false)
    expect(bonus).toBe(0)
    expect(matchPoints).toBe(Math.round(6 * (45 / TOTAL)))
  })

  it('nol benar, nol percobaan: skor 0 dan tidak dibagi nol', () => {
    const { score, accuracy, bonus } = computeScore(0, 0, TOTAL, false)
    expect(score).toBe(0)
    expect(accuracy).toBe(0)
    expect(bonus).toBe(0)
  })

  it('totalMatches nol: tidak dibagi nol', () => {
    const { score, matchPoints } = computeScore(0, 0, 0, false)
    expect(matchPoints).toBe(0)
    expect(score).toBe(0)
  })

  it('bonus dibulatkan dari akurasi', () => {
    // 10/13 = 0.769… → bonus round(0.769*5) = 4
    const { bonus } = computeScore(10, 13, TOTAL, true)
    expect(bonus).toBe(4)
  })
})
