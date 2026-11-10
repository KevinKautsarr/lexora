import { describe, expect, it } from 'vitest'
import { forgotPasswordErrorMessage } from '@/lib/forgot-password'

describe('forgotPasswordErrorMessage', () => {
  it('error null atau undefined -> mengembalikan null', () => {
    expect(forgotPasswordErrorMessage(null)).toBeNull()
    expect(forgotPasswordErrorMessage(undefined)).toBeNull()
  })

  it('status 429 -> mengembalikan pesan khusus rate limit', () => {
    expect(forgotPasswordErrorMessage({ status: 429 })).toBe(
      'Terlalu banyak percobaan \u2014 tunggu sebentar lalu coba lagi',
    )
    expect(
      forgotPasswordErrorMessage({
        status: 429,
        statusText: 'Too Many Requests',
        message: 'Rate limit exceeded',
      }),
    ).toBe('Terlalu banyak percobaan \u2014 tunggu sebentar lalu coba lagi')
  })

  it('error lain tak dikenal -> mengembalikan fallback aman', () => {
    expect(
      forgotPasswordErrorMessage({
        code: 'SOME_UNKNOWN_CODE',
        message: 'Database query failed',
      }),
    ).toBe('Gagal mengirim tautan reset \u2014 coba lagi')

    expect(
      forgotPasswordErrorMessage({
        message: 'Network offline',
      }),
    ).toBe('Gagal mengirim tautan reset \u2014 coba lagi')
  })

  it('kode error terdaftar di auth-errors -> mengembalikan pesan Indonesia yang sesuai', () => {
    expect(
      forgotPasswordErrorMessage({
        code: 'INVALID_EMAIL',
      }),
    ).toBe('Format email tidak valid')
  })
})

