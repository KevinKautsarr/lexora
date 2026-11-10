import { authErrorMessage } from './auth-errors'

export interface AuthClientError {
  code?: string
  message?: string
  status?: number
  statusText?: string
}

/**
 * Logika penentu pesan error untuk halaman lupa password.
 * - null/undefined -> null
 * - status 429 -> pesan khusus rate limit
 * - error lain -> authErrorMessage dengan fallback yang aman
 */
export function forgotPasswordErrorMessage(
  error: AuthClientError | null | undefined,
): string | null {
  if (!error) return null
  if (error.status === 429) {
    return 'Terlalu banyak percobaan — tunggu sebentar lalu coba lagi'
  }
  return authErrorMessage(error, 'Gagal mengirim tautan reset — coba lagi')
}

