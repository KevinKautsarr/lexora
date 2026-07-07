import { describe, expect, it } from 'vitest'
import {
  buildQueue,
  effectiveSlotCount,
  initialSlots,
  pickReplacement,
  MAX_VISIBLE_SLOTS,
  type CardInstance,
} from '@/app/(app)/game/queue'
import type { WordPair } from '@/app/(app)/game/MatchMadness'

const identity = <T,>(items: T[]): T[] => items

function makePairs(n: number): WordPair[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `w${i}`,
    english: `en${i}`,
    indonesian: `id${i}`,
  }))
}

describe('buildQueue', () => {
  it('menghasilkan setiap pair sebanyak `repeats` kali', () => {
    const pairs = makePairs(3)
    const queue = buildQueue(pairs, 2, identity)
    expect(queue).toHaveLength(6)
    const counts = new Map<string, number>()
    for (const card of queue) counts.set(card.wordId, (counts.get(card.wordId) ?? 0) + 1)
    expect([...counts.values()]).toEqual([2, 2, 2])
  })

  it('instanceId unik per repetisi', () => {
    const queue = buildQueue(makePairs(2), 2, identity)
    const ids = new Set(queue.map((c) => c.instanceId))
    expect(ids.size).toBe(4)
  })
})

describe('effectiveSlotCount', () => {
  it('dibatasi MAX_VISIBLE_SLOTS ketika kata unik banyak', () => {
    expect(effectiveSlotCount(8)).toBe(MAX_VISIBLE_SLOTS)
  })

  it('mengikuti jumlah kata unik ketika lebih sedikit dari MAX_VISIBLE_SLOTS', () => {
    expect(effectiveSlotCount(4)).toBe(4)
    expect(effectiveSlotCount(0)).toBe(0)
  })
})

describe('initialSlots', () => {
  it('slot aktif tidak pernah berisi dua instance dengan wordId sama (8 kata unik)', () => {
    const pairs = makePairs(8)
    const queue = buildQueue(pairs, 2, identity)
    const { active, waiting } = initialSlots(queue, pairs.length)
    expect(active).toHaveLength(MAX_VISIBLE_SLOTS)
    const wordIds = active.map((c) => c!.wordId)
    expect(new Set(wordIds).size).toBe(wordIds.length) // semua unik
    expect(active.length + waiting.length).toBe(16)
  })

  it('lesson dengan kata unik < MAX_VISIBLE_SLOTS: slot dibatasi, tetap tanpa duplikat', () => {
    // 4 kata unik x2 repeats = 8 instance, tapi hanya 4 kata unik →
    // slot aktif HARUS dibatasi ke 4, bukan 5 (mustahil 5 slot tanpa duplikat
    // dari hanya 4 wordId — pigeonhole).
    const pairs = makePairs(4)
    const queue = buildQueue(pairs, 2, identity)
    const { active, waiting } = initialSlots(queue, pairs.length)
    expect(active).toHaveLength(4)
    const wordIds = active.map((c) => c!.wordId)
    expect(new Set(wordIds).size).toBe(4)
    expect(waiting).toHaveLength(4)
  })
})

describe('pickReplacement', () => {
  const card = (wordId: string, rep: number): CardInstance => ({
    instanceId: `${wordId}-${rep}`,
    wordId,
    indonesian: wordId,
    english: wordId,
  })

  it('memilih kandidat yang wordId-nya tidak sedang aktif', () => {
    const active = [card('a', 0), card('b', 0), null]
    const waiting = [card('a', 1), card('c', 0)]
    const idx = pickReplacement(active, waiting)
    expect(waiting[idx].wordId).toBe('c')
  })

  it('mengembalikan -1 kalau antrian kosong', () => {
    expect(pickReplacement([card('a', 0)], [])).toBe(-1)
  })

  it('fallback ke kandidat pertama kalau semua bentrok (kasus tepi)', () => {
    const active = [card('a', 0)]
    const waiting = [card('a', 1)]
    expect(pickReplacement(active, waiting)).toBe(0)
  })
})
