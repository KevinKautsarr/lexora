import 'server-only'
import {
  createGameTokenCore,
  verifyGameTokenCore,
  type GameTokenCheck,
} from './game-token-core'

// Token "mulai main" — bukti kriptografis KAPAN halaman game dirender untuk
// user+lesson tertentu. submitScore menolak skor tanpa token valid, sehingga
// memanggil server action langsung (tanpa membuka game) tidak bisa dipakai
// farming XP/gems. Stateless (HMAC, tanpa tabel DB); dikombinasikan dengan
// syarat durasi-minimal & laju-match manusiawi di server action.
//
// File ini hanya wrapper tipis: baca secret dari env + blokir impor client.
// Logika sesungguhnya (teruji unit) ada di lib/game-token-core.ts.

export type { GameTokenCheck }

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET
  if (!s) throw new Error('BETTER_AUTH_SECRET belum diset')
  return s
}

/** Buat token saat halaman game dirender. Format: `<timestampMs>.<hmac>`. */
export function createGameToken(userId: string, lessonId: string): string {
  return createGameTokenCore(secret(), userId, lessonId)
}

/** Verifikasi token & hitung berapa lama sejak game dimulai. */
export function verifyGameToken(
  token: string,
  userId: string,
  lessonId: string,
): GameTokenCheck {
  return verifyGameTokenCore(secret(), token, userId, lessonId)
}
