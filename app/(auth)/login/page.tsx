'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  // Uncontrolled inputs: read values from the form on submit instead of
  // re-rendering on every keystroke.
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
      setError(error.message ?? 'Login gagal')
      // Move focus to the error so screen readers announce it and keyboard
      // users land on the problem instead of staying on the submit button.
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    router.push('/learn')
    router.refresh()
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-800/50 p-8"
      >
        <h1 className="text-2xl font-bold">Masuk LEXORA</h1>

        {error && (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="nama@contoh.com"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
          )}
          {loading ? 'Masuk…' : 'Masuk'}
        </button>

        <p className="text-center text-sm text-zinc-400">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-emerald-400 hover:underline">
            Daftar
          </Link>
        </p>
      </form>
    </>
  )
}
