'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Key } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, oauthErrorMessage } from '@/lib/auth-errors'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  // OAuth yang gagal/dibatalkan mendarat balik ke sini dengan ?error=…
  // (errorCallbackURL). Dibaca via window agar tak perlu Suspense boundary;
  // setState di dalam rAF agar tidak sinkron di body effect (aturan linter).
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('error')
    const message = oauthErrorMessage(code)
    if (!message) return
    const rafId = requestAnimationFrame(() => setError(message))
    return () => cancelAnimationFrame(rafId)
  }, [])

  // OAuth Google: browser di-redirect ke Google lalu kembali ke callbackURL.
  // Error hanya muncul bila redirect gagal dimulai (mis. provider belum
  // dikonfigurasi di server).
  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/learn',
      // Gagal/dibatalkan di sisi Google → balik ke login dengan ?error=…
      // (bukan halaman error default Better Auth yang berbahasa Inggris).
      errorCallbackURL: '/login',
    })
    if (error) {
      setGoogleLoading(false)
      setError(authErrorMessage(error, 'Masuk dengan Google gagal — coba lagi'))
      requestAnimationFrame(() => errorRef.current?.focus())
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    setError(null)
    setLoading(true)
    const { error } = await authClient.signIn.email({ email, password })
    setLoading(false)
    if (error) {
      setError(authErrorMessage(error, 'Login gagal — coba lagi'))
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    router.push('/learn')
    router.refresh()
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col rounded-[28px] border border-zinc-700/60 bg-zinc-800/90 p-8 shadow-[0_8px_32px_rgba(64,81,59,0.08)]"
      >
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-700/60 mb-6 select-none">
          <Link
            href="/login"
            aria-current="page"
            className="flex-1 text-center pb-3 text-base font-bold transition-all relative text-zinc-100 focus-visible:outline-none focus-visible:text-brand-600"
          >
            Masuk
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-[3px] bg-brand-500 rounded-full" />
          </Link>
          <Link
            href="/register"
            className="flex-1 text-center pb-3 text-base font-bold transition-all text-zinc-400 hover:text-zinc-300 focus-visible:outline-none focus-visible:text-zinc-300"
          >
            Daftar
          </Link>
        </div>

        {error && (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs font-medium text-red-700 focus:outline-none"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3.5">
          {/* Email field */}
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

          {/* Password field */}
          <div className="relative flex items-center">
            <Key className="absolute left-4 text-zinc-400 pointer-events-none" size={18} />
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••…"
              className="w-full rounded-2xl border border-zinc-700/60 bg-zinc-950/60 py-3.5 pl-12 pr-4 text-sm text-zinc-100 placeholder-zinc-400 transition-colors focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 focus-visible:outline-none"
            />
          </div>

          {/* Log in Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-600 border-b-[4px] border-brand-800 py-3.5 text-sm font-bold tracking-wider text-white transition-all hover:bg-brand-500 hover:border-brand-700 active:border-b-0 active:translate-y-[4px] disabled:opacity-50 select-none"
          >
            {loading && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden
              />
            )}
            {loading ? 'MASUK…' : 'MASUK'}
          </button>

          {/* Forgot Password */}
          <Link
            href="/forgot-password"
            className="text-center text-xs font-bold text-brand-600 hover:text-brand-500 transition-colors select-none py-1 hover:underline focus-visible:outline-none"
          >
            Lupa password?
          </Link>

          {/* Separator OR */}
          <div className="flex items-center gap-3 my-1 text-zinc-400 text-[10px] font-extrabold uppercase tracking-widest select-none">
            <span className="h-px flex-1 bg-zinc-700/60" />
            ATAU
            <span className="h-px flex-1 bg-zinc-700/60" />
          </div>

          {/* Social: Google (Full width) */}
          <div className="w-full select-none">
            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-zinc-700/60 bg-zinc-950/80 hover:bg-zinc-950 transition-colors text-[10px] font-black tracking-wider text-zinc-100 hover:text-brand-600 disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"
                  aria-hidden
                />
              ) : (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.2 10.3h11.4c.1.7.2 1.4.2 2.3 0 6.9-4.6 11.8-11.6 11.8C5.5 24.4 0 18.9 0 12.2S5.5 0 12.2 0c3.3 0 6 1.2 8.1 3.2L16.9 6.5C15.7 5.3 14.1 4.7 12.2 4.7c-4.1 0-7.4 3.4-7.4 7.5s3.3 7.5 7.4 7.5c4.7 0 6.5-3.4 6.8-5.1h-6.8v-4.3Z" />
                </svg>
              )}
              {googleLoading ? 'MENGHUBUNGKAN…' : 'MASUK DENGAN GOOGLE'}
            </button>
          </div>
        </div>

        {/* Agreement Footer */}
        <p className="mt-8 text-center text-[10px] leading-relaxed text-zinc-400 select-none text-pretty">
          Dengan melanjutkan, kamu menyetujui{' '}
          <Link href="/terms" className="text-brand-600 underline hover:text-brand-500">
            Ketentuan Layanan
          </Link>{' '}
          dan{' '}
          <Link href="/privacy" className="text-brand-600 underline hover:text-brand-500">
            Kebijakan Privasi
          </Link>
        </p>
      </form>
    </div>
  )
}
