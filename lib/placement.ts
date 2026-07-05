// Penilaian placement test — murni, tanpa IO, supaya gampang di-test.
// Kunci jawaban tidak pernah meninggalkan server: klien hanya menerima soal
// (kata Indonesia) + pilihan (kata Inggris) tanpa penanda mana yang benar.

export const PLACEMENT_TOTAL_QUESTIONS = 12
export const PLACEMENT_FROM_TARGET = 8
export const PLACEMENT_FROM_BELOW = 4
export const PLACEMENT_OPTIONS_PER_QUESTION = 4
export const PLACEMENT_PASS_MIN = 9 // >= 9 dari 12 (75%)
export const PLACEMENT_RETRY_MIN = 6 // 6-8 → rekomendasi satu level di bawah target
export const PLACEMENT_SESSION_FRESH_MINUTES = 30

export type PlacementGrade = { score: number; total: number; passed: boolean }

/** Nilai jawaban terhadap kunci; perbandingan string exact setelah trim. */
export function gradePlacement(
  correctTerms: string[],
  answers: (string | null)[],
): PlacementGrade {
  const total = correctTerms.length
  let score = 0
  for (let i = 0; i < total; i++) {
    const answer = answers[i]
    if (typeof answer === 'string' && answer.trim() === correctTerms[i].trim()) {
      score++
    }
  }
  return { score, total, passed: score >= PLACEMENT_PASS_MIN }
}

/**
 * Rekomendasi tingkat setelah GAGAL:
 * - skor 6-8 → satu level di bawah target (tidak lebih rendah dari terendah)
 * - skor < 6 → level terendah (Pemula)
 */
export function recommendLevelOrder(
  score: number,
  targetLevelOrder: number,
  lowestLevelOrder: number,
): number {
  if (score >= PLACEMENT_RETRY_MIN) {
    return Math.max(targetLevelOrder - 1, lowestLevelOrder)
  }
  return lowestLevelOrder
}
