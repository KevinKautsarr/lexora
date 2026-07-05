import { describe, expect, it } from 'vitest'
import {
  gradePlacement,
  recommendLevelOrder,
  PLACEMENT_PASS_MIN,
} from '@/lib/placement'

const key = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`)

describe('gradePlacement', () => {
  it('semua benar → lulus', () => {
    const correct = key(12)
    const g = gradePlacement(correct, [...correct])
    expect(g.score).toBe(12)
    expect(g.total).toBe(12)
    expect(g.passed).toBe(true)
  })

  it('tepat di ambang lulus (9/12) → lulus', () => {
    const correct = key(12)
    const answers = [...correct]
    answers[9] = 'salah'
    answers[10] = 'salah'
    answers[11] = 'salah'
    const g = gradePlacement(correct, answers)
    expect(g.score).toBe(PLACEMENT_PASS_MIN)
    expect(g.passed).toBe(true)
  })

  it('di bawah ambang (8/12) → gagal', () => {
    const correct = key(12)
    const answers = [...correct]
    answers[8] = answers[9] = answers[10] = answers[11] = 'salah'
    const g = gradePlacement(correct, answers)
    expect(g.score).toBe(8)
    expect(g.passed).toBe(false)
  })

  it('jawaban null dihitung salah', () => {
    const correct = key(12)
    const answers: (string | null)[] = [...correct]
    answers[0] = null
    expect(gradePlacement(correct, answers).score).toBe(11)
  })

  it('membandingkan setelah trim spasi', () => {
    expect(gradePlacement(['hello'], ['  hello  ']).score).toBe(1)
  })

  it('semua salah → skor 0', () => {
    expect(gradePlacement(key(12), key(12).map(() => 'x')).score).toBe(0)
  })
})

describe('recommendLevelOrder', () => {
  // target 4 (B2), terendah 1 (A1)
  it('skor 6-8 → satu level di bawah target', () => {
    expect(recommendLevelOrder(8, 4, 1)).toBe(3)
    expect(recommendLevelOrder(6, 4, 1)).toBe(3)
  })

  it('skor < 6 → level terendah', () => {
    expect(recommendLevelOrder(5, 4, 1)).toBe(1)
    expect(recommendLevelOrder(0, 4, 1)).toBe(1)
  })

  it('tidak turun di bawah level terendah', () => {
    // target 2, skor 7 → target-1 = 1 = terendah
    expect(recommendLevelOrder(7, 2, 1)).toBe(1)
  })
})
