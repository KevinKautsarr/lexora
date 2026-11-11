export type RevokeDecision =
  | { allowed: false; message: string }
  | { allowed: true }

/**
 * Logika murni penentu otorisasi pencabutan sesi perangkat lain:
 * - Jika user memiliki akun credential dengan password:
 *   - passwordInput kosong -> { allowed: false, message: 'Masukkan password untuk konfirmasi' }
 *   - isPasswordValid false -> { allowed: false, message: 'Password salah' }
 *   - isPasswordValid true -> { allowed: true }
 * - Jika user TIDAK memiliki password (Google-only):
 *   - Selalu diizinkan -> { allowed: true }
 */
export function evaluateRevokePassword({
  hasPassword,
  passwordInput,
  isPasswordValid,
}: {
  hasPassword: boolean
  passwordInput?: string | null
  isPasswordValid?: boolean
}): RevokeDecision {
  if (!hasPassword) {
    return { allowed: true }
  }

  const trimmed = passwordInput?.trim() ?? ''
  if (!trimmed) {
    return { allowed: false, message: 'Masukkan password untuk konfirmasi' }
  }

  if (!isPasswordValid) {
    return { allowed: false, message: 'Password salah' }
  }

  return { allowed: true }
}

