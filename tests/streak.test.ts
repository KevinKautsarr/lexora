import { describe, expect, it } from 'vitest'
import { isGoalMetToday, nextStreak, nextStreakWithFreeze, wibDateOnly } from '@/lib/streak'

const d = (iso: string) => new Date(iso)

describe('nextStreak', () => {
  it('pertama kali (belum ada aktivitas): mulai dari 1', () => {
    expect(nextStreak(0, null, d('2026-07-04T13:00:00Z'))).toBe(1)
  })

  it('hari WIB yang sama: streak tetap', () => {
    // 2026-07-04 01:00 WIB (2026-07-03T18:00Z) & 2026-07-04 23:00 WIB (16:00Z)
    expect(nextStreak(3, d('2026-07-03T18:00:00Z'), d('2026-07-04T16:00:00Z'))).toBe(3)
  })

  it('tepat kemarin (WIB): +1', () => {
    // last: 2026-07-03 (WIB), now: 2026-07-04 08:00 WIB (2026-07-04T01:00Z)
    expect(nextStreak(3, d('2026-07-03T05:00:00Z'), d('2026-07-04T01:00:00Z'))).toBe(4)
  })

  it('pagi WIB tetap dihitung hari ini, bukan kemarin (inti perbaikan timezone)', () => {
    // now: 2026-07-04 06:00 WIB = 2026-07-03T23:00Z (kemarin versi UTC).
    // last: 2026-07-04 00:30 WIB = 2026-07-03T17:30Z → hari WIB yang sama → tetap.
    expect(nextStreak(5, d('2026-07-03T17:30:00Z'), d('2026-07-03T23:00:00Z'))).toBe(5)
  })

  it('bolong ≥2 hari (WIB): reset ke 1', () => {
    expect(nextStreak(9, d('2026-07-01T05:00:00Z'), d('2026-07-04T05:00:00Z'))).toBe(1)
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
      last = wibDateOnly(now)
    }
    expect(streak).toBe(2)
    expect(longest).toBe(3)
  })
})

describe('nextStreakWithFreeze', () => {
  const dLast = d('2026-07-03T05:00:00Z') // hari WIB = 3 Juli

  it('hari sama / kemarin: tidak pakai freeze (sama seperti nextStreak)', () => {
    // kemarin (diff 1) → +1, freeze utuh
    expect(nextStreakWithFreeze(3, d('2026-07-02T05:00:00Z'), d('2026-07-03T05:00:00Z'), 3))
      .toEqual({ streak: 4, freezesUsed: 0 })
  })

  it('bolong 1 hari + punya freeze: streak selamat & lanjut, pakai 1 freeze', () => {
    // last 3 Juli, now 5 Juli (diff 2 = bolong 1 hari)
    expect(nextStreakWithFreeze(5, dLast, d('2026-07-05T05:00:00Z'), 2))
      .toEqual({ streak: 6, freezesUsed: 1 })
  })

  it('bolong 1 hari tapi TIDAK punya freeze: streak reset ke 1', () => {
    expect(nextStreakWithFreeze(5, dLast, d('2026-07-05T05:00:00Z'), 0))
      .toEqual({ streak: 1, freezesUsed: 0 })
  })

  it('bolong 2 hari + hanya 1 freeze (tidak cukup): reset ke 1, freeze tak terpakai', () => {
    // last 3 Juli, now 6 Juli (diff 3 = bolong 2 hari), butuh 2 freeze
    expect(nextStreakWithFreeze(5, dLast, d('2026-07-06T05:00:00Z'), 1))
      .toEqual({ streak: 1, freezesUsed: 0 })
  })

  it('bolong 2 hari + 2 freeze (cukup): selamat, pakai 2 freeze', () => {
    expect(nextStreakWithFreeze(5, dLast, d('2026-07-06T05:00:00Z'), 2))
      .toEqual({ streak: 6, freezesUsed: 2 })
  })

  it('belum pernah aktif: mulai 1 tanpa freeze', () => {
    expect(nextStreakWithFreeze(0, null, d('2026-07-05T05:00:00Z'), 3))
      .toEqual({ streak: 1, freezesUsed: 0 })
  })
})

describe('isGoalMetToday', () => {
  it('aktivitas hari WIB ini: goal tercapai', () => {
    expect(isGoalMetToday(d('2026-07-03T18:00:00Z'), d('2026-07-04T16:00:00Z'))).toBe(true)
  })

  it('aktivitas kemarin / belum pernah: goal belum tercapai', () => {
    expect(isGoalMetToday(d('2026-07-03T05:00:00Z'), d('2026-07-04T05:00:00Z'))).toBe(false)
    expect(isGoalMetToday(null, d('2026-07-04T12:00:00Z'))).toBe(false)
  })
})

describe('wibDateOnly', () => {
  it('memotong ke tengah malam WIB (bukan UTC)', () => {
    // 2026-07-04 23:59:59 UTC = 2026-07-05 06:59:59 WIB → hari WIB = 05 Juli.
    // Hasil kanonis: midnight UTC yang mewakili midnight WIB tanggal itu.
    expect(wibDateOnly(d('2026-07-04T23:59:59Z')).toISOString()).toBe(
      '2026-07-05T00:00:00.000Z',
    )
  })

  it('pukul 06.00 pagi WIB tetap di hari yang sama', () => {
    // 2026-07-08 23:00 UTC = 2026-07-09 06:00 WIB → hari WIB = 09 Juli.
    expect(wibDateOnly(d('2026-07-08T23:00:00Z')).toISOString()).toBe(
      '2026-07-09T00:00:00.000Z',
    )
  })
})
