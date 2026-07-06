'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  // Uncontrolled inputs: read values from the form on submit instead of
  // re-rendering on every keystroke.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '')
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    setError(null)
    setLoading(true)
    const { error } = await authClient.signUp.email({ name, email, password })
    setLoading(false)
    if (error) {
      setError(error.message ?? 'Registrasi gagal')
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
        <h1 className="text-2xl font-bold">Daftar LEXORA</h1>

        {error && (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
          Nama
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            maxLength={50}
            placeholder="Nama kamu"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-brand-500"
          />
        </label>

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
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-brand-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-brand-500"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
        >
          {loading && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
          )}
          {loading ? 'Mendaftar…' : 'Daftar'}
        </button>

        <p className="text-center text-sm text-zinc-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </>
  )
}
