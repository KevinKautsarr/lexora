'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Target, Zap } from 'lucide-react'
import Mascot from '@/components/Mascot'
import GoalRewardModal from '@/components/GoalRewardModal'
import { levelForXp } from '@/lib/level'
import type { SubmitScoreResult } from './actions'

// Layar hasil ronde Match Madness — dipisah dari MatchMadness supaya
// orkestrator game tetap fokus pada state permainan. Confetti hidup di sini
// (hanya ada saat layar hasil tampil).

export type SubmitState =
  | { status: 'idle' | 'saving' }
  | { status: 'saved'; result: Extract<SubmitScoreResult, { ok: true }> }
  | { status: 'error'; message: string }

type ConfettiParticle = {
  id: number
  left: string
  delay: string
  color: string
  size: number
  drift: string
  duration: string
}

export default function ResultScreen({
  allMatched,
  isLesson,
  localScore,
  accuracy,
  attempts,
  correctCount,
  totalMatches,
  userXp,
  submit,
  showRewardModal,
  onCloseRewardModal,
  onExit,
}: {
  allMatched: boolean
  isLesson: boolean
  localScore: number
  accuracy: number
  attempts: number
  correctCount: number
  totalMatches: number
  userXp: number
  submit: SubmitState
  showRewardModal: boolean
  onCloseRewardModal: () => void
  onExit: () => void
}) {
  // Partikel confetti di-generate sekali saat mount (layar hasil hanya muncul
  // sesudah game over). useEffect, bukan useMemo — Math.random() tidak boleh
  // dipanggil saat render (react-hooks/purity).
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
  useEffect(() => {
    if (!allMatched) return
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4899', '#8b5cf6']
    const rafId = requestAnimationFrame(() => {
      setConfettiParticles(
        Array.from({ length: 50 }).map((_, i) => ({
          id: i,
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * 1.5}s`,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 5,
          drift: `${Math.random() * 140 - 70}px`,
          duration: `${Math.random() * 1.2 + 1.2}s`,
        })),
      )
    })
    return () => cancelAnimationFrame(rafId)
  }, [allMatched])

  const finalScore = submit.status === 'saved' ? submit.result.score : localScore
  const accuracyPct = attempts > 0 ? Math.round(accuracy * 100) : 0
  const saving = submit.status === 'saving'
  const finalXp =
    submit.status === 'saved'
      ? submit.result.totalXp
      : userXp + (isLesson ? (allMatched ? localScore : 0) : 0)
  const currentLevel = levelForXp(finalXp)

  return (
    <>
      {/* Modal reward goal harian — muncul sebelum layar skor jika ada goal selesai */}
      {showRewardModal &&
        submit.status === 'saved' &&
        submit.result.goalsCompleted.length > 0 && (
          <GoalRewardModal
            rewards={submit.result.goalsCompleted}
            onClose={onCloseRewardModal}
          />
        )}
      <div className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-6 overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-800/40 p-8 text-center backdrop-blur-md shadow-2xl lg:max-w-lg">
        {/* Confetti overlay */}
        {allMatched && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
            {confettiParticles.map((p) => (
              <div
                key={p.id}
                className="confetti-particle"
                style={{
                  left: p.left,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                  backgroundColor: p.color,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  '--drift': p.drift,
                } as React.CSSProperties & Record<string, string>}
              />
            ))}
          </div>
        )}

        {/* Mascot Lexi & Header hasil */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl bg-zinc-900/60 p-4 shadow-inner">
            <Mascot xp={finalXp} mood={allMatched ? 'cheer' : 'sad'} size={120} />
            {allMatched && (
              <span className="absolute -right-2 -top-2 flex h-8 w-8 animate-bounce items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
                🎉
              </span>
            )}
          </div>
          <h2
            className={`font-display text-3xl font-extrabold tracking-tight ${
              allMatched ? 'text-brand-500' : 'text-red-500'
            }`}
          >
            {allMatched ? 'Luar Biasa!' : 'Waktu Habis'}
          </h2>
          <p className="text-xs font-semibold text-zinc-400">Lexi Level {currentLevel}</p>
        </div>

        {/* Skor utama */}
        <div className="flex flex-col items-center rounded-2xl bg-zinc-900/50 px-6 py-3 border border-zinc-700/40 min-w-[140px] shadow-sm">
          {isLesson ? (
            <>
              <span className="flex items-center gap-1 text-4xl font-black tabular-nums text-brand-500 animate-pulse">
                <Zap size={28} className="text-xp-500" aria-hidden />
                +{finalScore}
              </span>
              <span className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                XP Diperoleh
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 text-4xl font-black tabular-nums text-brand-500 animate-pulse">
                <Target size={28} className="text-brand-500 animate-pulse" aria-hidden />
                {finalScore}
              </span>
              <span className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Skor Latihan
              </span>
            </>
          )}
        </div>

        {/* Stat tiles: pasangan & akurasi */}
        <dl className="grid w-full grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4 shadow-sm">
            <Target size={18} className="text-brand-500" aria-hidden />
            <dd className="text-lg font-black tabular-nums text-zinc-100">
              {correctCount}/{totalMatches}
            </dd>
            <dt className="text-[11px] font-bold text-zinc-500">Pasangan</dt>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4 shadow-sm">
            <span className="text-lg" aria-hidden>
              🎯
            </span>
            <dd className="text-lg font-black tabular-nums text-zinc-100">{accuracyPct}%</dd>
            <dt className="text-[11px] font-bold text-zinc-500">Akurasi</dt>
          </div>
        </dl>

        {/* Status simpan — halus, tidak mengganggu */}
        {isLesson && (
          <p className="min-h-[1.25rem] text-xs" aria-live="polite">
            {saving && <span className="text-zinc-500 animate-pulse">Menyimpan skor...</span>}
            {submit.status === 'saved' && (
              <span className="font-semibold text-brand-500">
                Tersimpan · Total XP {submit.result.totalXp.toLocaleString('id-ID')}
                {submit.result.completed && submit.result.xpGain < submit.result.score && (
                  <span className="mt-0.5 block font-normal text-zinc-500 text-[11px]">
                    Pernah selesai — XP diperoleh 25%
                  </span>
                )}
              </span>
            )}
            {submit.status === 'error' && (
              <span className="font-medium text-red-500">{submit.message}</span>
            )}
          </p>
        )}

        {/* Tombol kembali ke Journey dengan look 3D */}
        <button
          type="button"
          disabled={saving}
          onClick={onExit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-brand-700 bg-brand-500 px-6 py-4 text-base font-black text-zinc-900 transition-all hover:bg-brand-400 hover:-translate-y-[2px] active:translate-y-[2px] active:border-b-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          Lanjut ke Journey
          <ArrowRight size={20} aria-hidden />
        </button>
      </div>
    </>
  )
}
