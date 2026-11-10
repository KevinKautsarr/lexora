import { describe, expect, it } from 'vitest'
import { authErrorMessage, oauthErrorMessage } from '@/lib/auth-errors'

describe('authErrorMessage', () => {
  it('kode dikenal -> mengembalikan pesan Indonesia yang benar', () => {
    expect(authErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD' }, 'Fallback default')).toBe(
      'Email atau password salah',
    )
    expect(authErrorMessage({ code: 'PASSWORD_TOO_SHORT' }, 'Fallback default')).toBe(
      'Password minimal 8 karakter',
    )
    expect(authErrorMessage({ code: 'INVALID_TOKEN' }, 'Fallback default')).toBe(
      'Tautan tidak valid atau sudah kedaluwarsa',
    )
  })

  it('kode tidak dikenal + message internal Inggris -> mengembalikan fallback (pesan internal TIDAK bocor)', () => {
    const leakedMessage = 'PrismaClientKnownRequestError: Unique constraint failed on the fields: (`email`)'
    const result = authErrorMessage(
      { code: 'UNKNOWN_INTERNAL_ERROR', message: leakedMessage },
      'Terjadi kesalahan \u2013 silakan coba lagi',
    )
    expect(result).toBe('Terjadi kesalahan \u2013 silakan coba lagi')
    expect(result).not.toContain('Prisma')
    expect(result).not.toContain('Unique constraint')
  })

  it('error null atau undefined -> mengembalikan fallback aman', () => {
    expect(authErrorMessage(null, 'Terjadi kesalahan')).toBe('Terjadi kesalahan')
    expect(authErrorMessage(undefined, 'Terjadi kesalahan')).toBe('Terjadi kesalahan')
  })

  it('objek error kosong atau tanpa code -> mengembalikan fallback aman', () => {
    expect(authErrorMessage({}, 'Terjadi kesalahan')).toBe('Terjadi kesalahan')
    expect(authErrorMessage({ message: 'raw error' }, 'Terjadi kesalahan')).toBe('Terjadi kesalahan')
  })
})

describe('oauthErrorMessage', () => {
  it('code null -> mengembalikan null', () => {
    expect(oauthErrorMessage(null)).toBeNull()
    expect(oauthErrorMessage('')).toBeNull()
  })

  it('code "access_denied" -> mengembalikan pesan dibatalkan', () => {
    expect(oauthErrorMessage('access_denied')).toContain('dibatalkan')
  })

  it('code error OAuth lain -> mengembalikan pesan gagal umum', () => {
    expect(oauthErrorMessage('server_error')).toContain('gagal')
    expect(oauthErrorMessage('unknown_error')).toContain('gagal')
  })
})

