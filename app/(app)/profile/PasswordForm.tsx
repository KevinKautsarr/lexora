'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    setLoading(true)
    // Endpoint /change-password Better Auth memvalidasi session + password
    // lama di server; revokeOtherSessions mengeluarkan perangkat lain.
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    setLoading(false)
    if (error) {
      setFeedback({ ok: false, message: error.message ?? 'Gagal mengganti password' })
      return
    }
    setFeedback({ ok: true, message: 'Password berhasil diganti' })
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
        Password lama
        <input
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
        Password baru (minimal 8 karakter)
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500"
        />
      </label>

      {feedback && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            feedback.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'
          }`}
        >
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? 'Mengganti…' : 'Ganti Password'}
      </button>
    </form>
  )
}
