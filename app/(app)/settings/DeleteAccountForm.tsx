'use client'

import { useState, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccount, type DeleteAccountState } from './actions'

export default function DeleteAccountForm({ email }: { email: string }) {
  const router = useRouter()
  const [typed, setTyped] = useState('')
  const [state, formAction, pending] = useActionState<DeleteAccountState, FormData>(
    deleteAccount,
    null,
  )

  // Setelah akun terhapus, arahkan ke login (sesi sudah dicabut di server).
  useEffect(() => {
    if (state?.ok) {
      router.push('/login')
      router.refresh()
    }
  }, [state, router])

  const matches = typed.trim().toLowerCase() === email.toLowerCase()

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500 leading-relaxed">
        Tindakan ini <span className="font-bold text-rose-400">permanen</span>. Semua data
        belajar — streak, XP, progres, gems — akan dihapus dan tidak bisa dikembalikan.
      </p>
      <label className="flex flex-col gap-1 text-xs font-bold text-zinc-400">
        Ketik <span className="font-black text-zinc-200">{email}</span> untuk konfirmasi
        <input
          type="text"
          name="confirm"
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={email}
          aria-label="Ketik email untuk konfirmasi hapus akun"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-rose-500"
        />
      </label>

      {state && !state.ok && (
        <p role="status" className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={!matches || pending}
        className="self-start rounded-xl border-b-4 border-rose-800 bg-rose-600 px-5 py-2.5 text-sm font-black text-white transition-[transform,background-color] hover:bg-rose-500 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:border-b-4 disabled:active:translate-y-0 cursor-pointer"
      >
        {pending ? 'Menghapus…' : 'Hapus akun permanen'}
      </button>
    </form>
  )
}
