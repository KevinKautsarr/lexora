'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await authClient.signUp.email({ name, email, password })
    setLoading(false)
    if (error) {
      setError(error.message ?? 'Registrasi gagal')
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
          <p className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
          Nama
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Mendaftar…' : 'Daftar'}
        </button>

        <p className="text-center text-sm text-zinc-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-emerald-400 hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </>
  )
}
