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
          autoComplete="name"
          defaultValue={currentName}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-brand-500"
        />
      </label>

      {state && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? 'bg-brand-100 text-brand-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
      >
        {pending ? 'Menyimpan…' : 'Simpan Nama'}
      </button>
    </form>
  )
}
