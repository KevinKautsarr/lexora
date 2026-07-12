'use client'

import { useState, useTransition } from 'react'
import { Gem } from 'lucide-react'
import { playSfx } from '@/lib/sfx'
import type { PurchaseState } from './actions'

// Tombol beli generik — memanggil server action pembelian, menampilkan
// feedback inline, dan membunyikan sfx reward saat sukses.
export default function BuyButton({
  action,
  price,
  disabled = false,
  disabledLabel,
}: {
  action: () => Promise<PurchaseState>
  price: number
  disabled?: boolean
  /** Teks pengganti saat disabled (mis. "Penuh", "Sedang aktif"). */
  disabledLabel?: string
}) {
  const [feedback, setFeedback] = useState<PurchaseState>(null)
  const [pending, startTransition] = useTransition()

  function handleBuy() {
    setFeedback(null)
    startTransition(async () => {
      const res = await action()
      setFeedback(res)
      if (res?.ok) playSfx('reward')
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleBuy}
        disabled={disabled || pending}
        className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 px-5 py-2.5 text-sm font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
          disabled
            ? 'cursor-not-allowed border-zinc-700 bg-zinc-800/60 text-zinc-500'
            : 'cursor-pointer border-emerald-700 bg-emerald-500 text-white hover:bg-emerald-400 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 disabled:opacity-60'
        }`}
      >
        {disabled && disabledLabel ? (
          disabledLabel
        ) : pending ? (
          'Memproses…'
        ) : (
          <>
            <Gem size={16} aria-hidden />
            {price.toLocaleString('id-ID')}
          </>
        )}
      </button>

      {feedback && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-xs font-bold ${
            feedback.ok
              ? 'bg-brand-100 text-brand-700'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  )
}
