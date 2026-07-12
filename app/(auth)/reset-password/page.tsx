'use client'

import { Suspense, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Key, ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-errors'

// Halaman tujuan tautan email reset. Better Auth memverifikasi token dulu di
// servernya lalu redirect ke sini dengan ?token=... (valid) atau ?error=...
// (kedaluwarsa/salah). useSearchParams butuh Suspense di App Router.

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token')
  const tokenError = params.get('error')

  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token) return
    const form = new FormData(e.currentTarget)
    const newPassword = String(form.get('password') ?? '')
    const confirm = String(form.get('confirm') ?? '')

    if (newPassword !== confirm) {
      setError('Konfirmasi password tidak sama')
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }

    setError(null)
    setLoading(true)
    const { error } = await authClient.resetPassword({ newPassword, token })
    setLoading(false)
    if (error) {
      setError(authErrorMessage(error, 'Gagal mengganti password — coba lagi'))
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    setDone(true)
    // Beri waktu membaca pesan sukses, lalu antar ke login.
    setTimeout(() => router.push('/login'), 2500)
  }

  // Token tidak valid / kedaluwarsa → arahkan minta tautan baru.
  if (tokenError || !token) {
    return (
      <div className="mt-4 flex flex-col gap-3 text-center" role="alert">
        <p className="text-sm font-bold text-zinc-100">Tautan tidak valid atau kedaluwarsa</p>
        <p className="text-xs leading-relaxed text-zinc-400">
          Tautan reset hanya berlaku 1 jam dan sekali pakai. Minta tautan baru
          untuk melanjutkan.
        </p>
        <Link
          href="/forgot-password"
          className="mx-auto mt-2 rounded-2xl bg-brand-600 border-b-[4px] border-brand-800 px-6 py-3 text-sm font-bold tracking-wider text-white transition-all hover:bg-brand-500 active:border-b-0 active:translate-y-[4px] select-none"
        >
          MINTA TAUTAN BARU
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mt-4 flex flex-col items-center gap-3 text-center" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-500">
          <ShieldCheck size={26} aria-hidden />
        </span>
        <p className="text-sm font-bold text-zinc-100">Password berhasil diganti!</p>
        <p className="text-xs text-zinc-400">
          Semua sesi lama dikeluarkan. Mengarahkanmu ke halaman masuk…
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
        Buat password baru untuk akunmu (minimal 8 karakter).
      </p>

      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs font-medium text-red-700 focus:outline-none"
          role="alert"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
        <div className="relative flex items-center">
          <Key className="absolute left-4 text-zinc-400 pointer-events-none" size={18} />
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Password baru…"
            className="w-full rounded-2xl border border-zinc-700/60 bg-zinc-950/60 py-3.5 pl-12 pr-4 text-sm text-zinc-100 placeholder-zinc-400 transition-colors focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 focus-visible:outline-none"
          />
        </div>
        <div className="relative flex items-center">
          <Key className="absolute left-4 text-zinc-400 pointer-events-none" size={18} />
          <input
            type="password"
            name="confirm"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Ulangi password baru…"
            className="w-full rounded-2xl border border-zinc-700/60 bg-zinc-950/60 py-3.5 pl-12 pr-4 text-sm text-zinc-100 placeholder-zinc-400 transition-colors focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 focus-visible:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 border-b-[4px] border-brand-800 py-3.5 text-sm font-bold tracking-wider text-white transition-all hover:bg-brand-500 hover:border-brand-700 active:border-b-0 active:translate-y-[4px] disabled:opacity-50 select-none cursor-pointer"
        >
          {loading && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
          )}
          {loading ? 'MENYIMPAN…' : 'SIMPAN PASSWORD BARU'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex w-full flex-col rounded-[28px] border border-zinc-700/60 bg-zinc-800/90 p-8 shadow-[0_8px_32px_rgba(64,81,59,0.08)]">
        <h1 className="text-lg font-black text-zinc-100">Password Baru</h1>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-500 transition-colors hover:underline focus-visible:outline-none"
        >
          <ArrowLeft size={14} aria-hidden />
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  )
}
