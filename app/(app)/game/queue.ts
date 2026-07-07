// Logika antrian kartu — murni, tanpa React/DOM, supaya gampang di-test dan
// dipakai ulang untuk validasi. MatchMadness.tsx hanya memanggil ini.

import type { WordPair } from './MatchMadness'

export type CardInstance = {
  /** Unik per instance (repetisi ke-1 dan ke-2 dari kata yang sama beda id). */
  instanceId: string
  wordId: string
  indonesian: string
  english: string
}

export const MAX_VISIBLE_SLOTS = 5

/**
 * Bangun antrian penuh: tiap pair muncul `repeats` kali, lalu diacak.
 * Urutan acak inilah yang menentukan urutan kemunculan di antrian.
 */
export function buildQueue(
  pairs: WordPair[],
  repeats: number,
  shuffle: <T>(items: T[]) => T[],
): CardInstance[] {
  const instances: CardInstance[] = []
  for (const pair of pairs) {
    for (let rep = 0; rep < repeats; rep++) {
      instances.push({
        instanceId: `${pair.id}-${rep}`,
        wordId: pair.id,
        indonesian: pair.indonesian,
        english: pair.english,
      })
    }
  }
  return shuffle(instances)
}

/**
 * Berapa slot yang boleh tampil sekaligus: minimal dari MAX_VISIBLE_SLOTS
 * dan jumlah kata UNIK. Ini penting — kalau lesson cuma py. 4 kata unik
 * (repeats=2 → 8 instance) tapi slot dipaksa 5, mustahil menghindari dua
 * instance dari kata yang sama tampil bersamaan (pigeonhole). Membatasi
 * slot ke jumlah kata unik menjaga aturan "tidak ada pasangan sama tampil
 * bersamaan" selalu terpenuhi.
 */
export function effectiveSlotCount(uniqueWordCount: number): number {
  return Math.max(0, Math.min(MAX_VISIBLE_SLOTS, uniqueWordCount))
}

/**
 * Cari index instance di `pool` yang wordId-nya TIDAK ada di `excludeWordIds`.
 * Dipakai baik untuk mengisi slot awal maupun mengganti slot yang kosong.
 */
function findNonConflicting(pool: CardInstance[], excludeWordIds: ReadonlySet<string>): number {
  return pool.findIndex((c) => !excludeWordIds.has(c.wordId))
}

/**
 * Isi slot aktif awal dari antrian, satu per satu, sambil menjaga tidak ada
 * dua instance dari wordId yang sama masuk slot aktif bersamaan.
 */
export function initialSlots(
  queue: CardInstance[],
  uniqueWordCount: number,
): {
  active: (CardInstance | null)[]
  waiting: CardInstance[]
} {
  const slotCount = effectiveSlotCount(uniqueWordCount)
  const active: CardInstance[] = []
  const activeWordIds = new Set<string>()
  const pool = [...queue]

  for (let i = 0; i < slotCount; i++) {
    const idx = findNonConflicting(pool, activeWordIds)
    if (idx === -1) break // tidak ada kandidat valid tersisa (seharusnya tak terjadi)
    const [card] = pool.splice(idx, 1)
    active.push(card)
    activeWordIds.add(card.wordId)
  }

  return { active, waiting: pool }
}

/**
 * Cari index instance di `waiting` yang wordId-nya TIDAK sedang tampil di
 * `active` (mencegah dua instance dari kata yang sama terlihat bersamaan).
 * Kalau semua kandidat bentrok (mustahil selama effectiveSlotCount dihormati,
 * dijaga untuk kasus tepi), pakai kandidat pertama daripada macet.
 */
export function pickReplacement(
  active: (CardInstance | null)[],
  waiting: CardInstance[],
): number {
  if (waiting.length === 0) return -1
  const activeWordIds = new Set(
    active.filter((c): c is CardInstance => c !== null).map((c) => c.wordId),
  )
  const validIndex = findNonConflicting(waiting, activeWordIds)
  return validIndex !== -1 ? validIndex : 0
}
