import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { auth } from './auth'

// Ambil user dari session Better Auth pada request saat ini (server-side).
// Dibungkus React.cache(): dalam satu request, validasi session hanya jalan
// sekali walau dipanggil banyak komponen (layout, UserStats, sidebar cards…).
export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
})
