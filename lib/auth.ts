import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
  },
  // nextCookies harus jadi plugin terakhir: menyalin Set-Cookie ke
  // cookie store Next saat auth API dipanggil dari server actions.
  plugins: [nextCookies()],
})
