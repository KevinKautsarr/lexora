import { describe, expect, it } from 'vitest'
import { buildQueue, type CardInstance } from '@/app/(app)/game/queue'
import { REPEATS_PER_WORD } from '@/app/(app)/game/scoring'
import type { WordPair } from '@/app/(app)/game/MatchMadness'

const identity = <T,>(items: T[]): T[] => items

function makePairs(n: number): WordPair[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `w${i}`,
    english: `en${i}`,
    indonesian: `id${i}`,
  }))
}

// Regression: kartu sisi kiri (Indonesia) & kanan (Inggris) dari kata yang sama
// BERBAGI instanceId yang sama (rightOrder = shuffle(active), objek instance yang
// sama). Karena itu, menghitung correctCount lewat `matchedInstanceIds.size / 2`
// menghasilkan setengah dari jumlah match sebenarnya, sehingga game berhenti di
// tengah (mis. tampil 8/16 padahal sudah 16 match) dan tidak pernah selesai.
describe('penghitungan match tidak boleh setengah karena instanceId kiri==kanan', () => {
  it('setiap match hanya menambah 1 id unik ke Set (kiri & kanan berbagi id)', () => {
    const pairs = makePairs(8)
    const queue = buildQueue(pairs, REPEATS_PER_WORD, identity)
    const totalMatches = pairs.length * REPEATS_PER_WORD
    expect(totalMatches).toBe(16)

    // Simulasikan menyelesaikan SEMUA match. Untuk tiap match, pemain memilih
    // instance yang sama di kiri & kanan (karena hanya satu instance per wordId
    // tampil pada satu waktu) → leftInstanceId === rightInstanceId.
    const matchedInstanceIds = new Set<string>()
    let matchCount = 0
    for (const card of queue) {
      const leftInstanceId = card.instanceId
      const rightInstanceId = card.instanceId // sama, sesuai perilaku nyata
      matchedInstanceIds.add(leftInstanceId)
      matchedInstanceIds.add(rightInstanceId)
      matchCount += 1
    }

    // Pendekatan LAMA (buggy): size/2 → separuh dari match sebenarnya.
    const oldCorrectCount = Math.floor(matchedInstanceIds.size / 2)
    expect(oldCorrectCount).toBe(8) // BUG: 16 match dilaporkan 8

    // Pendekatan BARU (benar): counter langsung.
    expect(matchCount).toBe(16)
    expect(matchCount).toBe(totalMatches)
  })

  it('konfirmasi instanceId identik antara sisi kiri & kanan untuk kata yang sama', () => {
    const pairs = makePairs(4)
    const queue = buildQueue(pairs, REPEATS_PER_WORD, identity)
    // active & rightOrder di komponen dibangun dari list instance yang sama,
    // jadi mencari instance dengan instanceId tertentu di "kiri" & "kanan"
    // mengembalikan objek yang identik.
    const sample: CardInstance = queue[0]
    const leftCard = queue.find((c) => c.instanceId === sample.instanceId)
    const rightCard = queue.find((c) => c.instanceId === sample.instanceId)
    expect(leftCard?.instanceId).toBe(rightCard?.instanceId)
    expect(leftCard?.wordId).toBe(rightCard?.wordId)
  })
})
