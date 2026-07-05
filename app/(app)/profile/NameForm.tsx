'use client'

import { useActionState } from 'react'
import { updateName, type UpdateNameState } from './actions'

export default function NameForm({ currentName }: { currentName: string }) {
  const [state, formAction, pending] = useActionState<UpdateNameState, FormData>(
    updateName,
    null,
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
        Nama
        <input
          type="text"
          name="name"
          required
          maxLength={50}
          defaultValue={currentName}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-emerald-500 focus:outline-none"
        />
      </label>

      {state && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? 'Menyimpan…' : 'Simpan Nama'}
      </button>
    </form>
  )
}
