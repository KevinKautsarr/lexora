import 'server-only'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from './prisma'

export const auth = betterAuth({
  // Di production WAJIB set BETTER_AUTH_URL ke URL publik aplikasi
  // (mis. https://lexora.vercel.app) — dipakai untuk origin check CSRF,
  // cookie, dan callback. Di dev cukup http://localhost:3000.
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Matikan cek "session freshness" (default 1 hari). Tanpa ini, endpoint
    // manajemen sesi (listSessions/revokeSessions) melempar SESSION_NOT_FRESH
    // untuk sesi lama. Aksi sensitif (hapus akun) sudah dilindungi konfirmasi
    // ketik-ulang email di sisi aplikasi, jadi freshness check tak diperlukan.
    freshAge: 0,
  },
  // nextCookies harus jadi plugin terakhir: menyalin Set-Cookie ke
  // cookie store Next saat auth API dipanggil dari server actions.
  plugins: [nextCookies()],
})
