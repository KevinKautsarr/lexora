// Peta kode error Better Auth -> pesan Indonesia untuk form auth.
// Aman diimpor client component (murni data + fungsi).

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Email atau password salah',
  INVALID_PASSWORD: 'Password salah',
  INVALID_EMAIL: 'Format email tidak valid',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Email ini sudah terdaftar \u2013 coba masuk',
  // USER_EMAIL_NOT_FOUND dihapus: hanya muncul di social sign-in via idToken
  // yang tidak dipakai Lexora (OAuth redirect, bukan idToken). Tidak akan
  // pernah sampai ke client di alur email/password maupun forgot-password.
  PASSWORD_TOO_SHORT: 'Password minimal 8 karakter',
  PASSWORD_TOO_LONG: 'Password terlalu panjang',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'Akun ini masuk lewat Google dan tidak memakai password',
  ACCOUNT_NOT_FOUND: 'Akun tidak ditemukan',
  INVALID_TOKEN: 'Tautan tidak valid atau sudah kedaluwarsa',
  TOKEN_NOT_FOUND: 'Tautan tidak valid atau sudah kedaluwarsa',
  EMAIL_NOT_VERIFIED:
    'Email belum diverifikasi \u2013 tautan verifikasi baru saja dikirim ulang, cek inbox/spam',
  PROVIDER_NOT_FOUND: 'Login Google belum dikonfigurasi',
  PROVIDER_NOT_CONFIGURED: 'Login Google belum dikonfigurasi',
}

/** Pesan Indonesia untuk error Better Auth; jatuh ke `fallback` bila tak dikenal.
 *  KEAMANAN: message mentah dari Better Auth TIDAK diteruskan ke client untuk
 *  mencegah kebocoran detail internal (mis. pesan DB). Kode tidak dikenal
 *  selalu mengembalikan `fallback`. */
export function authErrorMessage(
  error: { code?: string | undefined; message?: string | undefined } | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]
  // Jatuh ke fallback -- JANGAN teruskan error.message mentah.
  return fallback
}

/** Pesan untuk query `?error=` hasil redirect gagal OAuth (mis. user membatalkan). */
export function oauthErrorMessage(code: string | null): string | null {
  if (!code) return null
  if (code === 'access_denied') return 'Login Google dibatalkan \u2013 silakan coba lagi'
  return 'Masuk dengan Google gagal \u2013 silakan coba lagi'
}
