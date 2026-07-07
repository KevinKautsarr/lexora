export const GAME_DURATION = 60

// Setiap kata muncul 2x dalam satu sesi (repetisi utk latihan ingatan).
export const REPEATS_PER_WORD = 2

// Skor maksimal SATU lesson (bukan per kartu) — dibagi 90% dari jumlah
// pencocokan benar + 10% bonus akurasi, supaya distribusinya sama seperti
// formula lama tapi totalnya diskalakan ke nilai yang lebih wajar.
export const MAX_LESSON_SCORE = 50
const MATCH_SHARE = 0.9
const MAX_ACCURACY_BONUS = MAX_LESSON_SCORE * (1 - MATCH_SHARE) // 5

/**
 * Satu-satunya rumus skor — dipakai klien untuk tampilan dan server sebagai
 * nilai otoritatif saat menyimpan.
 *
 * @param correctCount jumlah pencocokan benar (bisa >wordCount karena tiap
 *   kata muncul REPEATS_PER_WORD kali)
 * @param attempts total percobaan (benar + salah)
 * @param totalMatches total pencocokan yang harus diselesaikan untuk lesson
 *   ini = wordCount * REPEATS_PER_WORD
 * @param completed apakah semua totalMatches sudah tercocok
 */
export function computeScore(
  correctCount: number,
  attempts: number,
  totalMatches: number,
  completed: boolean,
) {
  const accuracy = attempts > 0 ? correctCount / attempts : 0
  const pointsPerMatch = totalMatches > 0 ? (MAX_LESSON_SCORE * MATCH_SHARE) / totalMatches : 0
  const matchPoints = Math.round(correctCount * pointsPerMatch)
  const bonus = completed ? Math.round(accuracy * MAX_ACCURACY_BONUS) : 0
  return { score: matchPoints + bonus, accuracy, bonus, matchPoints }
}
