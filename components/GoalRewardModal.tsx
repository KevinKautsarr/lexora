'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { GoalReward } from '@/app/(app)/game/actions'

type GoalRewardModalProps = {
  rewards: GoalReward[]
  onClose: () => void
}

// Spring-physics keyframe — bounce masuk dari bawah (hierarchy motion: enter from below = deeper)
const CHEST_OPEN_DELAY_MS = 600
const ITEMS_FLY_DELAY_MS = 900

export default function GoalRewardModal({ rewards, onClose }: GoalRewardModalProps) {
  const [phase, setPhase] = useState<'locked' | 'glow' | 'open' | 'items'>('locked')

  useEffect(() => {
    // Animasi sequence: locked → glow → open → items muncul
    const t1 = setTimeout(() => setPhase('glow'), 200)
    const t2 = setTimeout(() => setPhase('open'), CHEST_OPEN_DELAY_MS)
    const t3 = setTimeout(() => setPhase('items'), ITEMS_FLY_DELAY_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  // Total gems dari semua reward yang diraih
  const totalGems = rewards.reduce((sum, r) => sum + r.gems, 0)
  const boosterReward = rewards.find((r) => r.boosterMultiplier)

  return (
    // Overlay scrim: 50% black agar konten latar tidak bersaing (UI/UX Pro Max: scrim 40–60%)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Hadiah Goal Harian"
    >
      <style>{`
        @keyframes chest-bounce-in {
          0% { transform: scale(0.6) translateY(40px); opacity: 0; }
          60% { transform: scale(1.08) translateY(-8px); opacity: 1; }
          80% { transform: scale(0.97) translateY(2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes reward-fly-up {
          0% { transform: translateY(24px) scale(0.5); opacity: 0; }
          60% { transform: translateY(-6px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes modal-in {
          0% { transform: scale(0.88) translateY(24px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes gem-float {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes confetti-burst {
          0% { transform: scale(0); opacity: 1; }
          80% { transform: scale(1.4); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        .chest-bounce { animation: chest-bounce-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .reward-fly { animation: reward-fly-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .modal-in { animation: modal-in 0.35s cubic-bezier(0.34, 1.2, 0.64, 1) forwards; }
        .gem-float { animation: gem-float 2.5s ease-in-out infinite; }
        .confetti-ring { animation: confetti-burst 0.8s ease-out forwards; }
      `}</style>

      {/* Modal Card — Claymorphism: multi-shadow depth, radius 40, glassmorphism blend */}
      <div
        className="modal-in relative mx-4 flex w-full max-w-sm flex-col items-center gap-6 overflow-hidden rounded-[2.5rem] border border-zinc-700/60 bg-zinc-900/95 p-8 text-center"
        style={{
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Decorative glowing orb background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #f59e0b 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        {/* Goal labels */}
        <div className="relative z-10 flex flex-col gap-1.5 w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Goal Selesai! 🎯
          </p>
          <div className="flex flex-col gap-1">
            {rewards.map((r) => (
              <p key={r.goalId} className="text-xs font-bold text-zinc-300">
                ✓ {r.label}
              </p>
            ))}
          </div>
        </div>

        {/* Chest */}
        <div className="relative z-10 flex flex-col items-center gap-0">
          {/* Confetti ring */}
          {phase === 'open' || phase === 'items' ? (
            <div
              className="confetti-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full border-4 border-amber-400/40 pointer-events-none"
              aria-hidden="true"
            />
          ) : null}

          <div
            className={`relative ${phase !== 'locked' ? 'chest-bounce' : ''}`}
            style={{ opacity: phase === 'locked' ? 0.7 : 1 }}
          >
            <Image
              src={
                phase === 'open' || phase === 'items'
                  ? '/icons-flat/256/chest-open-gold.png'
                  : phase === 'glow'
                    ? '/icons-flat/256/chest-gold-glow.png'
                    : '/icons-flat/256/chest-locked-grey.png'
              }
              alt={phase === 'open' || phase === 'items' ? 'Peti hadiah terbuka' : 'Peti hadiah'}
              width={148}
              height={148}
              className="drop-shadow-[0_12px_32px_rgba(245,158,11,0.4)] select-none"
              priority
            />
          </div>
        </div>

        {/* Reward items — muncul saat phase='items' */}
        {phase === 'items' && (
          <div className="relative z-10 flex flex-col items-center gap-4 w-full">
            {/* Gems */}
            <div className="reward-fly flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/15 px-5 py-3">
              <div className="gem-float relative h-10 w-10 shrink-0">
                <Image
                  src="/icons-flat/128/gem-emerald.png"
                  alt="Gems"
                  fill
                  sizes="40px"
                  className="object-contain drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)]"
                />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-amber-700 leading-none tabular-nums">
                  +{totalGems}
                </p>
                <p className="text-[11px] font-bold text-zinc-500">Gems diperoleh</p>
              </div>
            </div>

            {/* Booster Potion — hanya tampil jika ada reward booster */}
            {boosterReward && boosterReward.boosterMultiplier && (
              <div
                className="reward-fly flex items-center gap-3 rounded-2xl border border-purple-500/40 bg-purple-500/15 px-5 py-3"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="relative h-10 w-10 shrink-0">
                  <Image
                    src="/icons-flat/128/booster-potion-2x.png"
                    alt={`EXP Booster ${boosterReward.boosterMultiplier}x`}
                    fill
                    sizes="40px"
                    className="object-contain drop-shadow-[0_4px_12px_rgba(139,92,246,0.5)]"
                  />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-purple-700 leading-none">
                    {boosterReward.boosterMultiplier}x EXP
                  </p>
                  <p className="text-[11px] font-bold text-zinc-500">
                    Booster aktif {boosterReward.boosterDurationMinutes} menit
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA Button — min 44×44px touch target (UI/UX Pro Max guideline) */}
        {phase === 'items' && (
          <button
            type="button"
            onClick={onClose}
            className="reward-fly relative z-10 w-full min-h-[52px] rounded-2xl border-b-4 border-amber-700 bg-amber-500 px-6 py-3.5 text-base font-black text-zinc-900 transition-[transform,background-color] duration-150 hover:bg-amber-400 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            style={{ animationDelay: '0.2s' }}
          >
            Klaim Hadiah! ✨
          </button>
        )}
      </div>
    </div>
  )
}
