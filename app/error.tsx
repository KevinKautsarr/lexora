'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, Map } from 'lucide-react'
import Mascot from '@/components/Mascot'

// Error boundary segmen — menangkap error render/server component di bawah
// root layout (DB down, query gagal, dsb). Layout & CSS global tetap hidup
// di sini, jadi boleh pakai komponen & token tema seperti biasa.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Tetap tercatat di console/monitoring — user tak perlu lihat detailnya.
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <Mascot pose="confused" size={130} className="select-none" />

      <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-100">
        Waduh, ada yang tidak beres
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
        Terjadi kesalahan saat memuat halaman ini. Biasanya cuma sementara —
        coba muat ulang. Progres belajarmu aman tersimpan.
      </p>

      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border-b-4 border-brand-700 bg-brand-500 px-6 py-2.5 text-sm font-black text-white transition-all hover:bg-brand-400 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <RotateCcw size={16} aria-hidden />
          Coba lagi
        </button>
        <Link
          href="/learn"
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800/60 px-6 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:border-brand-500/40 hover:text-brand-500"
        >
          <Map size={16} aria-hidden />
          Kembali ke Journey
        </Link>
      </div>

      {error.digest && (
        <p className="mt-2 text-[10px] font-mono text-zinc-600">
          Kode error: {error.digest}
        </p>
      )}
    </main>
  )
}
