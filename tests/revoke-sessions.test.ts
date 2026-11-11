import { describe, expect, it } from 'vitest'
import { evaluateRevokePassword } from '@/lib/revoke-sessions'

describe('evaluateRevokePassword', () => {
  it('user Google-only (hasPassword=false) -> diizinkan langsung tanpa password', () => {
    const res = evaluateRevokePassword({
      hasPassword: false,
    })
    expect(res).toEqual({ allowed: true })
  })

  it('user Google-only (hasPassword=false) dengan input kosong -> diizinkan', () => {
    const res = evaluateRevokePassword({
      hasPassword: false,
      passwordInput: '',
    })
    expect(res).toEqual({ allowed: true })
  })

  it('user credential (hasPassword=true) tanpa input password -> ditolak dengan pesan konfirmasi', () => {
    const resEmpty = evaluateRevokePassword({
      hasPassword: true,
      passwordInput: '',
    })
    expect(resEmpty).toEqual({
      allowed: false,
      message: 'Masukkan password untuk konfirmasi',
    })

    const resWhitespace = evaluateRevokePassword({
      hasPassword: true,
      passwordInput: '   ',
    })
    expect(resWhitespace).toEqual({
      allowed: false,
      message: 'Masukkan password untuk konfirmasi',
    })

    const resNull = evaluateRevokePassword({
      hasPassword: true,
      passwordInput: null,
    })
    expect(resNull).toEqual({
      allowed: false,
      message: 'Masukkan password untuk konfirmasi',
    })
  })

  it('user credential (hasPassword=true) dengan password salah (isPasswordValid=false) -> ditolak', () => {
    const res = evaluateRevokePassword({
      hasPassword: true,
      passwordInput: 'wrong-pass',
      isPasswordValid: false,
    })
    expect(res).toEqual({
      allowed: false,
      message: 'Password salah',
    })
  })

  it('user credential (hasPassword=true) dengan password benar (isPasswordValid=true) -> diizinkan', () => {
    const res = evaluateRevokePassword({
      hasPassword: true,
      passwordInput: 'correct-pass',
      isPasswordValid: true,
    })
    expect(res).toEqual({ allowed: true })
  })
})

