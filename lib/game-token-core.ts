import { createHmac, timingSafeEqual } from 'node:crypto'

// Logika token "mulai main" MURNI — secret dioper sebagai parameter, tanpa
// import 'server-only', supaya bisa di-unit-test dengan vitest. Wrapper yang
// membaca env & memblokir client ada di lib/game-token.ts.

export const MAX_TOKEN_AGE_MS = 6 * 60 * 60 * 1000 // 6 jam — sesi wajar terlama

function sign(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

/** Buat token saat halaman game dirender. Format: `<timestampMs>.<hmac>`. */
export function createGameTokenCore(
  secret: string,
  userId: string,
  lessonId: string,
  now = Date.now(),
): string {
  return `${now}.${sign(secret, `${userId}.${lessonId}.${now}`)}`
}

export type GameTokenCheck = { ok: true; elapsedMs: number } | { ok: false }

/** Verifikasi token & hitung berapa lama sejak game dimulai. */
export function verifyGameTokenCore(
  secret: string,
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

  const expected = sign(secret, `${userId}.${lessonId}.${ts}`)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false }

  const elapsedMs = now - ts
  if (elapsedMs < 0 || elapsedMs > MAX_TOKEN_AGE_MS) return { ok: false }
  return { ok: true, elapsedMs }
}
