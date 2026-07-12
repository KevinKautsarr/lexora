'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-errors'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') ?? '')

    setError(null)
    setLoading(true)
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })
    setLoading(false)
    if (error) {
      setError(authErrorMessage(error, 'Gagal mengirim email — coba lagi'))
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    // Selalu tampilkan pesan yang sama walau email tidak terdaftar —
    // mencegah orang memakai form ini untuk menebak email siapa yang punya akun.
    setSent(true)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex w-full flex-col rounded-[28px] border border-zinc-700/60 bg-zinc-800/90 p-8 shadow-[0_8px_32px_rgba(64,81,59,0.08)]">
        <h1 className="text-lg font-black text-zinc-100">Lupa Password</h1>

        {sent ? (
          <div className="mt-4 flex flex-col items-center gap-3 text-center" role="status">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-500">
              <MailCheck size={26} aria-hidden />
            </span>
            <p className="text-sm font-bold text-zinc-100">Cek inbox email-mu</p>
            <p className="text-xs leading-relaxed text-zinc-400">
              Kalau email itu terdaftar di Lexora, tautan untuk membuat password baru
              sudah kami kirim. Berlaku 1 jam — cek juga folder spam.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Masukkan email akunmu. Kami kirimkan tautan untuk membuat password baru.
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
                <Mail className="absolute left-4 text-zinc-400 pointer-events-none" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  placeholder="email@example.com…"
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
                {loading ? 'MENGIRIM…' : 'KIRIM TAUTAN RESET'}
              </button>
            </form>
          </>
        )}

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
