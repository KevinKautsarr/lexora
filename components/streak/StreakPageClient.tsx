'use client'

import { Flame, Award, Trophy } from 'lucide-react'
import Mascot from '@/components/Mascot'
import { isGoalMetToday } from '@/lib/streak'
import StreakCalendar from './StreakCalendar'

type TopStreakUser = {
  id: string
  name: string | null
  email: string
  streak: number
  image: string | null
}

type StreakPageClientProps = {
  currentUserId: string
  user: {
    xp: number
    streak: number
    longestStreak: number
    lastActivityDate: Date | null
    startLevelOrder: number
    division: string
    streakFreezes: number
  }
  completedDates: string[]
  currentLevel: string
  accuracyPercent: string
  topStreaks: TopStreakUser[]
}

export default function StreakPageClient({
  user,
  completedDates,
  currentLevel,
  accuracyPercent,
}: StreakPageClientProps) {
  // Streak "berisiko" = punya streak berjalan tapi belum belajar hari ini →
  // Lexi tampil pose 'streak-danger' (mengantuk/khawatir). Kalau aman atau
  // belum mulai, pakai pose 'streak-keeper' (ceria dengan api).
  const activeToday = isGoalMetToday(user.lastActivityDate, new Date())
  const isInDanger = user.streak > 0 && !activeToday
  // Berisiko → mengantuk; sudah belajar hari ini → jempol; belum mulai → penjaga api.
  const mascotPose = isInDanger ? 'streak-danger' : activeToday ? 'thumbsup' : 'streak-keeper'

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 px-2 sm:px-4">
      {/* ── Grid 2 Kolom Responsif — items-stretch agar kedua panel sama tinggi
          (di desktop). Di mobile (grid-cols-1) tetap menumpuk normal. ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-6 md:items-stretch">
        {/* ── PANEL KIRI: Status Streak, Perfect Streak, Level & Akurasi ── */}
        <div className="flex h-full flex-col gap-5 rounded-3xl border border-zinc-700 bg-zinc-800/70 p-5 shadow-sm">
          {/* Header Judul Sederhana */}
          <h1 className="font-display text-xl font-extrabold tracking-wide text-zinc-100 pb-3 border-b border-zinc-700 uppercase">
            Streak
          </h1>

          {/* Streak Status — angka besar + Lexi (streak-keeper / danger). */}
          <div className="flex items-center justify-between gap-2 px-2 pt-2">
            <div className="flex flex-col">
              <span className="text-6xl font-black text-orange-500 leading-none tracking-tight tabular-nums">
                {user.streak}
              </span>
              <span className="text-sm font-black text-orange-500 tracking-wide mt-1 uppercase">
                day streak!
              </span>
              <p className="mt-2 max-w-[150px] text-xs font-semibold text-zinc-400 leading-snug">
                {isInDanger
                  ? 'Belajar hari ini untuk jaga streak-mu!'
                  : activeToday
                    ? 'Streak kamu aman hari ini. Mantap!'
                    : 'Mulai belajar untuk menyalakan streak!'}
              </p>
            </div>
            <Mascot
              pose={mascotPose}
              size={128}
              className="shrink-0 drop-shadow-[0_8px_24px_rgba(249,115,22,0.28)]"
            />
          </div>

          {/* Perfect Streak Card */}
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <Flame size={20} aria-hidden="true" className="fill-orange-500" />
            </div>
            <p className="text-xs font-bold text-zinc-300 leading-relaxed">
              Keep your <span className="text-orange-500">Perfect Streak</span> by doing a lesson
              every day!
            </p>
          </div>

          {/* STATS ROW (Level Aktif & Akurasi) - Dipindah ke Kolom Kiri */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            {/* Level Aktif */}
            <div className="group flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4 transition-[transform,border-color,background-color] duration-300 hover:border-xp-400/40 hover:bg-xp-400/5 hover:-translate-y-0.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-xp-400/10 text-xp-400 border border-xp-400/25 transition-colors duration-200 group-hover:bg-xp-400/20">
                <Trophy size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                  Level Aktif
                </p>
                <p className="text-sm font-black text-zinc-200">{currentLevel}</p>
              </div>
            </div>

            {/* Akurasi */}
            <div className="group flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4 transition-[transform,border-color,background-color] duration-300 hover:border-brand-500/40 hover:bg-brand-500/5 hover:-translate-y-0.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/25 transition-colors duration-200 group-hover:bg-brand-500/20">
                <Award size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                  Akurasi
                </p>
                <p className="text-sm font-black text-zinc-200">{accuracyPercent}</p>
              </div>
            </div>
          </div>

          {/* Rekor Terbaik */}
          <section className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4 flex items-center justify-between shadow-sm transition-[transform,border-color,background-color] duration-300 hover:border-orange-500/30 hover:bg-orange-500/5 hover:-translate-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Rekor Streak Terbaik
            </span>
            <span className="flex items-center gap-1.5 text-sm font-black text-zinc-300">
              <Flame size={16} aria-hidden="true" className="text-orange-500" />
              {user.longestStreak} Hari
            </span>
          </section>
        </div>

        {/* ── PANEL KANAN: Kalender Streak ── */}
        <div className="h-full rounded-3xl border border-zinc-700 bg-zinc-800/70 p-5 shadow-sm">
          <StreakCalendar completedDates={completedDates} streakFreezes={user.streakFreezes} />
        </div>
      </div>
    </div>
  )
}
