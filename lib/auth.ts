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
  // nextCookies harus jadi plugin terakhir: menyalin Set-Cookie ke
  // cookie store Next saat auth API dipanggil dari server actions.
  plugins: [nextCookies()],
})
