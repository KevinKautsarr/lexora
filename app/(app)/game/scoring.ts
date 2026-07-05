export const GAME_DURATION = 60
export const POINTS_PER_MATCH = 100
export const MAX_ACCURACY_BONUS = 100

// Satu-satunya rumus skor — dipakai klien untuk tampilan dan server
// sebagai nilai otoritatif saat menyimpan.
export function computeScore(correctCount: number, attempts: number, completed: boolean) {
  const accuracy = attempts > 0 ? correctCount / attempts : 0
  const bonus = completed ? Math.round(accuracy * MAX_ACCURACY_BONUS) : 0
  return { score: correctCount * POINTS_PER_MATCH + bonus, accuracy, bonus }
}
