import Link from 'next/link'
import { ChevronLeft, BookOpen, Infinity, Gamepad2, User, TrendingUp } from 'lucide-react'

// Judul untuk kedua halaman auth — login/register adalah client component
// sehingga tidak bisa mengekspor metadata sendiri.
export const metadata = { title: 'Masuk atau Daftar' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 p-4 font-sans antialiased select-none">
      {/* Decorative backdrop shapes */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

      {/* Back navigation button — kembali ke halaman utama (landing), bukan app. */}
      <Link
        href="/"
        aria-label="Kembali ke halaman utama"
        className="absolute left-6 top-6 flex items-center gap-1.5 text-sm font-black text-zinc-300 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 z-30"
      >
        <ChevronLeft size={18} strokeWidth={2.5} aria-hidden />
        Kembali
      </Link>

      <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-12 lg:flex-row lg:gap-24">
        {/* Form container */}
        <div className="w-full max-w-[400px] shrink-0 z-10">
          {children}
        </div>

        {/* Desktop marketing features panel */}
        <div className="hidden max-w-sm flex-col gap-6 lg:flex z-10">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-zinc-100 text-pretty leading-tight select-none">
            Mulai Petualangan Bahasamu
          </h2>
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-brand-600 border border-zinc-700/60 shadow-sm">
                <Gamepad2 size={20} strokeWidth={2.5} aria-hidden />
              </span>
              <span className="font-bold text-base tracking-wide text-zinc-100">Belajar Sambil Bermain</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-brand-600 border border-zinc-700/60 shadow-sm">
                <Infinity size={20} strokeWidth={2.5} aria-hidden />
              </span>
              <span className="font-bold text-base tracking-wide text-zinc-100">Latihan Tanpa Batas</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-brand-600 border border-zinc-700/60 shadow-sm">
                <User size={20} strokeWidth={2.5} aria-hidden />
              </span>
              <span className="font-bold text-base tracking-wide text-zinc-100">Sesuai Levelmu</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-brand-600 border border-zinc-700/60 shadow-sm">
                <TrendingUp size={20} strokeWidth={2.5} aria-hidden />
              </span>
              <span className="font-bold text-base tracking-wide text-zinc-100">Lacak Progresmu</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-brand-600 border border-zinc-700/60 shadow-sm">
                <BookOpen size={20} strokeWidth={2.5} aria-hidden />
              </span>
              <span className="font-bold text-base tracking-wide text-zinc-100">Kosakata Bertingkat</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}


