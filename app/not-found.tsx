'use client'

import Link from 'next/link'
import { Home, Compass } from 'lucide-react'
import Mascot from '@/components/Mascot'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12 text-center select-none font-sans antialiased">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex max-w-md flex-col items-center gap-6">
        {/* Mascot container with pulse animations */}
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-zinc-900/40 border border-zinc-800/80 p-2 shadow-inner">
          <Mascot pose="thinking" size={100} />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-brand-500">
            Halaman Tidak Ditemukan
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-zinc-100">
            Waduh, 404! 🦖
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400 text-pretty">
            Lexi sudah mencari ke mana-mana, tapi halaman yang kamu cari tidak bisa ditemukan atau telah dipindahkan.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex w-full flex-col sm:flex-row gap-3 mt-2">
          <Link
            href="/learn"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-brand-600 border-b-[4px] border-brand-800 py-3 text-sm font-bold text-white transition-all hover:bg-brand-500 hover:border-brand-700 active:border-b-0 active:translate-y-[4px] shadow-lg shadow-brand-900/20"
          >
            <Home size={16} strokeWidth={2.5} aria-hidden />
            Mulai Belajar
          </Link>
          <Link
            href="/leaderboard"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 py-3 text-sm font-bold text-zinc-200 transition-all hover:bg-zinc-800 hover:text-white"
          >
            <Compass size={16} strokeWidth={2.5} aria-hidden />
            Leaderboard
          </Link>
        </div>
      </div>
    </main>
  )
}
