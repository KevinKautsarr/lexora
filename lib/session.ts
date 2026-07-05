import { headers } from 'next/headers'
import { auth } from './auth'

// Ambil user dari session Better Auth pada request saat ini (server-side).
export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}
