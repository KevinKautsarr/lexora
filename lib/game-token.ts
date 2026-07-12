import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

// Token "mulai main" — bukti kriptografis KAPAN halaman game dirender untuk
// user+lesson tertentu. submitScore menolak skor tanpa token valid, sehingga
// memanggil server action langsung (tanpa membuka game) tidak bisa dipakai
// farming XP/gems. Stateless (HMAC, tanpa tabel DB); dikombinasikan dengan
// syarat durasi-minimal & laju-match manusiawi di server action.

const MAX_TOKEN_AGE_MS = 6 * 60 * 60 * 1000 // 6 jam — sesi wajar terlama

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET
  if (!s) throw new Error('BETTER_AUTH_SECRET belum diset')
  return s
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

/** Buat token saat halaman game dirender. Format: `<timestampMs>.<hmac>`. */
export function createGameToken(userId: string, lessonId: string, now = Date.now()): string {
  return `${now}.${sign(`${userId}.${lessonId}.${now}`)}`
}

export type GameTokenCheck = { ok: true; elapsedMs: number } | { ok: false }

/** Verifikasi token & hitung berapa lama sejak game dimulai. */
export function verifyGameToken(
  token: string,
  userId: string,
  lessonId: string,
  now = Date.now(),
): GameTokenCheck {
  const dot = token.indexOf('.')
  if (dot <= 0) return { ok: false }
  const ts = Number(token.slice(0, dot))
  const sig = token.slice(dot + 1)
  if (!Number.isFinite(ts) || sig.length === 0) return { ok: false }

  const expected = sign(`${userId}.${lessonId}.${ts}`)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false }

  const elapsedMs = now - ts
  if (elapsedMs < 0 || elapsedMs > MAX_TOKEN_AGE_MS) return { ok: false }
  return { ok: true, elapsedMs }
}
