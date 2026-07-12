'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Search, Volume2, X } from 'lucide-react'

export type DictionaryUnit = {
  id: string
  title: string
  words: { id: string; term: string; translation: string }[]
}

export default function DictionaryClient({ units }: { units: DictionaryUnit[] }) {
  const [query, setQuery] = useState('')
  // Accordion eksklusif: hanya satu unit terbuka. Default: unit pertama,
  // supaya halaman tidak tampak kosong saat pertama dibuka.
  const [openUnitId, setOpenUnitId] = useState<string | null>(units[0]?.id ?? null)
  // Kata yang sedang diucapkan — tombolnya menyala selama TTS berbunyi,
  // supaya ada umpan balik nyata (motion conveys meaning, bukan dekorasi).
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  function speak(word: { id: string; term: string }) {
    try {
      if (!('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(word.term)
      u.lang = 'en-US'
      u.rate = 0.9 // sedikit lambat — konteks belajar
      u.onend = () => setSpeakingId((cur) => (cur === word.id ? null : cur))
      u.onerror = () => setSpeakingId(null)
      setSpeakingId(word.id)
      window.speechSynthesis.speak(u)
    } catch {
      setSpeakingId(null)
    }
  }

  const searching = query.trim().length > 0

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return units
    return units
      .map((u) => ({
        ...u,
        words: u.words.filter(
          (w) =>
            w.term.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q),
        ),
      }))
      .filter((u) => u.words.length > 0)
  }, [units, query])

  const totalWords = useMemo(
    () => filtered.reduce((sum, u) => sum + u.words.length, 0),
    [filtered],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* ── Pencarian — sticky agar tetap terjangkau di daftar panjang ── */}
      <div className="sticky top-0 z-10 -mx-1 bg-zinc-950/85 px-1 py-2 backdrop-blur-md">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kata Inggris atau artinya…"
            aria-label="Cari kosakata"
            className="w-full rounded-2xl border border-zinc-700/60 bg-zinc-800/70 py-3.5 pl-11 pr-11 text-sm font-semibold text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-700/60 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 cursor-pointer"
            >
              <X size={15} aria-hidden />
            </button>
          )}
        </div>
        <p aria-live="polite" className="mt-1.5 px-1 text-[11px] font-bold tabular-nums text-zinc-500">
          {totalWords.toLocaleString('id-ID')} kata{searching ? ' ditemukan' : ''}
        </p>
      </div>

      {/* ── Hasil kosong: arahkan, jangan hanya melapor ─────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-800/40 px-6 py-10 text-center">
          <p className="text-sm font-bold text-zinc-200">
            Tidak ada kata yang cocok dengan “{query}”
          </p>
          <p className="max-w-xs text-xs text-zinc-500">
            Coba kata yang lebih pendek, atau cek tingkat lain — kata itu mungkin ada
            di level yang berbeda.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-1 rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs font-black text-brand-500 transition-colors hover:bg-brand-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 cursor-pointer"
          >
            Hapus pencarian
          </button>
        </div>
      ) : (
        filtered.map((unit) => {
          // Saat mencari, semua unit dengan hasil dipaksa terbuka — hasil
          // tidak boleh tersembunyi di balik panel tertutup.
          const open = searching || openUnitId === unit.id
          return (
            <section
              key={unit.id}
              className="overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-800/40"
            >
              {/* Header bab = tombol accordion (target ≥44px) */}
              <button
                type="button"
                onClick={() =>
                  setOpenUnitId((cur) => (cur === unit.id ? null : unit.id))
                }
                disabled={searching}
                aria-expanded={open}
                aria-controls={`unit-panel-${unit.id}`}
                className={`flex min-h-[52px] w-full items-center gap-2.5 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/50 ${
                  searching ? 'cursor-default' : 'cursor-pointer hover:bg-zinc-800/70'
                }`}
              >
                <span className="relative h-5 w-5 shrink-0 select-none" aria-hidden>
                  <Image
                    src="/assets/icon-book.png"
                    alt=""
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-black text-zinc-100">
                  {unit.title}
                </span>
                <span className="shrink-0 rounded-full bg-zinc-900/60 border border-zinc-700/50 px-2 py-0.5 text-[10px] font-bold tabular-nums text-zinc-400">
                  {unit.words.length} kata
                </span>
                <ChevronDown
                  size={16}
                  aria-hidden
                  className={`shrink-0 text-zinc-500 transition-transform duration-200 motion-reduce:transition-none ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Panel — animasi grid-rows 200ms (mulus tanpa mengukur height) */}
              <div
                id={`unit-panel-${unit.id}`}
                className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
              >
                <div className="min-h-0 overflow-hidden">
                  <ul className="flex flex-col gap-1.5 border-t border-zinc-700/40 px-3 pb-3 pt-2.5">
                    {unit.words.map((w) => {
                      const speaking = speakingId === w.id
                      return (
                        <li
                          key={w.id}
                          className="flex items-center gap-3 rounded-xl border border-zinc-700/40 bg-zinc-900/30 px-3 py-2 transition-colors hover:border-zinc-600/60 hover:bg-zinc-900/50"
                        >
                          {/* Touch target 44px + state "sedang bicara" */}
                          <button
                            type="button"
                            onClick={() => speak(w)}
                            aria-label={`Dengar pengucapan ${w.term}`}
                            aria-pressed={speaking}
                            tabIndex={open ? 0 : -1}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 active:scale-95 cursor-pointer ${
                              speaking
                                ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                                : 'border-brand-500/25 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20'
                            }`}
                          >
                            <Volume2 size={17} aria-hidden />
                          </button>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-black leading-tight text-zinc-100">
                              {w.term}
                            </span>
                            <span className="block truncate text-xs leading-snug text-zinc-400">
                              {w.translation}
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
