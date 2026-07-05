import { describe, expect, it } from 'vitest'
import { isGoalMetToday, nextStreak, utcDateOnly } from '@/lib/streak'

const d = (iso: string) => new Date(iso)

describe('nextStreak', () => {
  it('pertama kali (belum ada aktivitas): mulai dari 1', () => {
    expect(nextStreak(0, null, d('2026-07-04T13:00:00Z'))).toBe(1)
  })

  it('hari yang sama: streak tetap', () => {
    expect(nextStreak(3, d('2026-07-04T00:00:00Z'), d('2026-07-04T23:59:00Z'))).toBe(3)
  })

  it('tepat kemarin: +1 — termasuk melewati batas jam UTC', () => {
    expect(nextStreak(3, d('2026-07-03T00:00:00Z'), d('2026-07-04T00:01:00Z'))).toBe(4)
  })

  it('bolong ≥2 hari: reset ke 1', () => {
    expect(nextStreak(9, d('2026-07-01T00:00:00Z'), d('2026-07-04T12:00:00Z'))).toBe(1)
  })

  it('longestStreak: max dari rangkaian nextStreak (pola yang dipakai submitScore)', () => {
    // 3 hari beruntun → bolong → 2 hari beruntun; longest harus 3
    const days = ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-06', '2026-07-07']
    let streak = 0
    let longest = 0
    let last: Date | null = null
    for (const day of days) {
      const now = d(`${day}T10:00:00Z`)
      streak = nextStreak(streak, last, now)
      longest = Math.max(longest, streak)
      last = utcDateOnly(now)
    }
    expect(streak).toBe(2)
    expect(longest).toBe(3)
  })
})

describe('isGoalMetToday', () => {
  it('aktivitas hari ini: goal tercapai', () => {
    expect(isGoalMetToday(d('2026-07-04T00:00:00Z'), d('2026-07-04T23:59:00Z'))).toBe(true)
  })

  it('aktivitas kemarin / belum pernah: goal belum tercapai', () => {
    expect(isGoalMetToday(d('2026-07-03T00:00:00Z'), d('2026-07-04T00:01:00Z'))).toBe(false)
    expect(isGoalMetToday(null, d('2026-07-04T12:00:00Z'))).toBe(false)
  })
})

describe('utcDateOnly', () => {
  it('memotong jam ke tengah malam UTC', () => {
    expect(utcDateOnly(d('2026-07-04T23:59:59Z')).toISOString()).toBe(
      '2026-07-04T00:00:00.000Z',
    )
  })
})
