import { describe, expect, it } from 'vitest'
import {
  createGameTokenCore,
  verifyGameTokenCore,
  MAX_TOKEN_AGE_MS,
} from '@/lib/game-token-core'

const SECRET = 'test-secret-yang-cukup-panjang'
const USER = 'user-abc'
const LESSON = 'lesson-xyz'

describe('game token', () => {
  it('roundtrip valid: token yang dibuat lolos verifikasi dengan elapsed benar', () => {
    const t0 = 1_700_000_000_000
    const token = createGameTokenCore(SECRET, USER, LESSON, t0)
    const res = verifyGameTokenCore(SECRET, token, USER, LESSON, t0 + 45_000)
    expect(res).toEqual({ ok: true, elapsedMs: 45_000 })
  })

  it('ditolak untuk user berbeda', () => {
    const token = createGameTokenCore(SECRET, USER, LESSON)
    expect(verifyGameTokenCore(SECRET, token, 'user-lain', LESSON).ok).toBe(false)
  })

  it('ditolak untuk lesson berbeda', () => {
    const token = createGameTokenCore(SECRET, USER, LESSON)
    expect(verifyGameTokenCore(SECRET, token, USER, 'lesson-lain').ok).toBe(false)
  })

  it('ditolak dengan secret berbeda', () => {
    const token = createGameTokenCore(SECRET, USER, LESSON)
    expect(verifyGameTokenCore('secret-salah', token, USER, LESSON).ok).toBe(false)
  })

  it('ditolak bila signature dimanipulasi', () => {
    const token = createGameTokenCore(SECRET, USER, LESSON)
    const [ts, sig] = token.split('.')
    const flipped = sig.slice(0, -1) + (sig.endsWith('A') ? 'B' : 'A')
    expect(verifyGameTokenCore(SECRET, `${ts}.${flipped}`, USER, LESSON).ok).toBe(false)
  })

  it('ditolak bila timestamp dimanipulasi (memalsukan elapsed lebih lama)', () => {
    const t0 = 1_700_000_000_000
    const token = createGameTokenCore(SECRET, USER, LESSON, t0)
    const sig = token.split('.')[1]
    // Mundurkan timestamp 1 jam agar terlihat "sudah main lama" — sig tak cocok.
    const forged = `${t0 - 3_600_000}.${sig}`
    expect(verifyGameTokenCore(SECRET, forged, USER, LESSON, t0 + 1000).ok).toBe(false)
  })

  it('ditolak bila kedaluwarsa (melewati MAX_TOKEN_AGE_MS)', () => {
    const t0 = 1_700_000_000_000
    const token = createGameTokenCore(SECRET, USER, LESSON, t0)
    expect(
      verifyGameTokenCore(SECRET, token, USER, LESSON, t0 + MAX_TOKEN_AGE_MS + 1).ok,
    ).toBe(false)
  })

  it('ditolak bila timestamp di masa depan', () => {
    const t0 = 1_700_000_000_000
    const token = createGameTokenCore(SECRET, USER, LESSON, t0 + 60_000)
    expect(verifyGameTokenCore(SECRET, token, USER, LESSON, t0).ok).toBe(false)
  })

  it('ditolak untuk input cacat', () => {
    for (const bad of ['', 'abc', '.', '123.', '.sig', 'bukan-angka.sig', '123']) {
      expect(verifyGameTokenCore(SECRET, bad, USER, LESSON).ok).toBe(false)
    }
  })
})
