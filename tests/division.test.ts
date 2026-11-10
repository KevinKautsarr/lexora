import { describe, expect, it } from 'vitest'
import { parseDivision, VALID_DIVISIONS } from '@/lib/division'

describe('division validation', () => {
  it('semua nilai VALID_DIVISIONS diterima dengan benar', () => {
    expect(parseDivision('BRONZE', 'BRONZE')).toBe('BRONZE')
    expect(parseDivision('SILVER', 'BRONZE')).toBe('SILVER')
    expect(parseDivision('GOLD', 'BRONZE')).toBe('GOLD')
  })

  it('nilai huruf kecil dinormalisasi ke huruf besar', () => {
    expect(parseDivision('bronze', 'BRONZE')).toBe('BRONZE')
    expect(parseDivision('silver', 'BRONZE')).toBe('SILVER')
    expect(parseDivision('gold', 'BRONZE')).toBe('GOLD')
  })

  it('nilai tidak valid (typo, unknown tier) -> mengembalikan fallback', () => {
    expect(parseDivision('DIAMOND', 'BRONZE')).toBe('BRONZE')
    expect(parseDivision('PLATINUM', 'SILVER')).toBe('SILVER')
    expect(parseDivision('MASTER', 'GOLD')).toBe('GOLD')
    expect(parseDivision('invalid', 'BRONZE')).toBe('BRONZE')
  })

  it('nilai null atau undefined -> mengembalikan fallback', () => {
    expect(parseDivision(undefined, 'BRONZE')).toBe('BRONZE')
    expect(parseDivision(null, 'SILVER')).toBe('SILVER')
  })

  it('nilai asing (termasuk string aneh) -> fallback', () => {
    expect(parseDivision("' OR 1=1 --", 'BRONZE')).toBe('BRONZE')
    expect(parseDivision('; DROP TABLE users;', 'BRONZE')).toBe('BRONZE')
    expect(parseDivision('<script>alert(1)</script>', 'BRONZE')).toBe('BRONZE')
  })

  it('VALID_DIVISIONS hanya berisi 3 divisi yang sah', () => {
    expect(Array.from(VALID_DIVISIONS)).toEqual(['BRONZE', 'SILVER', 'GOLD'])
  })
})

