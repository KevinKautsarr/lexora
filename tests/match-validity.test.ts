import { describe, expect, it } from 'vitest'
import { buildQueue, isValidMatch, type CardInstance } from '@/app/(app)/game/queue'
import type { WordPair } from '@/app/(app)/game/MatchMadness'

const identity = <T,>(items: T[]): T[] => items

// Regression untuk bug: "ketika ada 2 pasang kata yang sama, mencocokkan salah
// satu malah membenarkan pasangan lainnya sekaligus."
//
// Penyebab: match dulu divalidasi lewat wordId. Kata yang sama muncul 2x
// (REPEATS_PER_WORD) sebagai instance berbeda (w0-0, w0-1). Kalau keduanya
// tampil bersamaan, kiri-w0-0 + kanan-w0-1 punya wordId sama → keliru dianggap
// benar & menandai kedua pasang. isValidMatch harus membandingkan instanceId.
describe('isValidMatch — cocok hanya untuk instance yang sama persis', () => {
  const pairs: WordPair[] = [{ id: 'w0', english: 'book', indonesian: 'buku' }]
  const queue = buildQueue(pairs, 2, identity)
  const inst0 = queue.find((c) => c.instanceId === 'w0-0')!
  const inst1 = queue.find((c) => c.instanceId === 'w0-1')!

  it('dua instance dari kata yang sama punya wordId sama tapi instanceId beda', () => {
    expect(inst0.wordId).toBe(inst1.wordId) // wordId sama
    expect(inst0.instanceId).not.toBe(inst1.instanceId) // instanceId beda
  })

  it('match instance yang sama (kiri & kanan w0-0) → VALID', () => {
    expect(isValidMatch(inst0, inst0)).toBe(true)
  })

  it('match silang antar duplikat (kiri w0-0, kanan w0-1) → TIDAK VALID (inti bug)', () => {
    // Sebelum fix: ini lolos karena wordId sama. Setelah fix: gagal.
    expect(isValidMatch(inst0, inst1)).toBe(false)
    expect(isValidMatch(inst1, inst0)).toBe(false)
  })

  it('kartu null/undefined → tidak valid', () => {
    expect(isValidMatch(null, inst0)).toBe(false)
    expect(isValidMatch(inst0, undefined)).toBe(false)
    expect(isValidMatch(null, null)).toBe(false)
  })

  it('dua pasang kata dengan teks identik tapi id berbeda tidak saling cocok', () => {
    // Skenario "2 pasang kata yang sama" versi id berbeda (mis. dari 2 lesson).
    const dupPairs: WordPair[] = [
      { id: 'a', english: 'book', indonesian: 'buku' },
      { id: 'b', english: 'book', indonesian: 'buku' },
    ]
    const q = buildQueue(dupPairs, 1, identity)
    const a = q.find((c) => c.wordId === 'a')!
    const b = q.find((c) => c.wordId === 'b')!
    expect(isValidMatch(a, b)).toBe(false) // teks sama, instance beda → tidak cocok
    expect(isValidMatch(a, a)).toBe(true)
  })
})
