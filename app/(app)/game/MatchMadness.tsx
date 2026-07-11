'use client'

import type React from 'react'
import { ArrowRight, Target, Zap } from 'lucide-react'
import { startTransition, useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Mascot from '@/components/Mascot'
import { levelForXp } from '@/lib/level'
import { submitScore, type SubmitScoreResult } from './actions'
import { GAME_DURATION, REPEATS_PER_WORD, computeScore } from './scoring'
import { buildQueue, initialSlots, pickReplacement, isValidMatch, type CardInstance } from './queue'
import GoalRewardModal from '@/components/GoalRewardModal'

export type WordPair = { id: string; english: string; indonesian: string }

type SubmitState =
  | { status: 'idle' | 'saving' }
  | { status: 'saved'; result: Extract<SubmitScoreResult, { ok: true }> }
  | { status: 'error'; message: string }

// Jeda sebelum slot yang baru saja cocok diisi kartu antrian berikutnya —
// beri waktu pemain melihat feedback "benar" sebelum kartu baru muncul.
const REPLACE_DELAY_MS = 2000

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function MatchMadness({
  pairs,
  lessonId,
  userXp = 0,
}: {
  pairs: WordPair[]
  lessonId?: string
  userXp?: number
}) {
  const router = useRouter()
  const totalMatches = pairs.length * REPEATS_PER_WORD

  // State awal dibangun TANPA acak (urutan pairs apa adanya) — identik antara
  // render server & render pertama client, menghindari hydration mismatch.
  // Pengacakan sungguhan terjadi di handleShuffle(), dipanggil dari effect
  // setelah mount (bukan langsung di body effect) via requestAnimationFrame
  // agar tidak dianggap "setState sinkron dalam effect" oleh linter, dan
  // supaya user tetap melihat kartu teracak sebelum sempat berinteraksi.
  const buildInitial = (roundPairs: WordPair[]) => {
    const queue = buildQueue(roundPairs, REPEATS_PER_WORD, (items) => items)
    const { active, waiting: rest } = initialSlots(queue, roundPairs.length)
    return { active, waiting: rest, rightOrder: active }
  }

  // active + waiting + rightOrder digabung SATU state supaya penggantian slot
  // (baca semuanya, tulis semuanya) selalu atomik dalam satu updater — tidak
  // ada race antar setState terpisah yang saling bergantung.
  const [slots, setSlots] = useState<{
    active: (CardInstance | null)[]
    waiting: CardInstance[]
    rightOrder: (CardInstance | null)[]
  }>(() => buildInitial(pairs))
  const { active: activeSlots, waiting, rightOrder } = slots

  const slotsRef = useRef(slots)
  useEffect(() => {
    slotsRef.current = slots
  }, [slots])

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  // Instance yang sudah dicocokkan — penanda visual "kartu hilang". Kartu kiri
  // (Indonesia) & kanan (Inggris) dari kata yang sama BERBAGI instanceId yang
  // sama, jadi Set ini TIDAK bisa dipakai menghitung jumlah match (dua sisi =
  // satu id). Penghitungan match memakai counter terpisah `matchCount`.
  const [matchedInstanceIds, setMatchedInstanceIds] = useState<Set<string>>(new Set())
  const [matchCount, setMatchCount] = useState(0)
  const [successIds, setSuccessIds] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null)
  const [pendingClear, setPendingClear] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStarted, setGameStarted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })
  const [showRewardModal, setShowRewardModal] = useState(false)

  // Timeout penggantian kartu yang masih tertunda — dibatalkan saat game over
  // atau ronde baru supaya kartu antrian tidak "muncul lagi" setelah selesai.
  const replaceTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  // Partikel confetti di-generate sekali saat allMatched=true menggunakan
  // useState + useEffect, BUKAN useMemo, agar Math.random() tidak dipanggil
  // selama render (melanggar react-hooks/purity).
  type ConfettiParticle = {
    id: number; left: string; delay: string; color: string;
    size: number; drift: string; duration: string
  }
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])

  const correctCount = matchCount
  const allMatched = totalMatches > 0 && correctCount === totalMatches
  const gameOver = allMatched || timeLeft === 0

  // Nilai gameOver terkini, dibaca dari dalam callback setTimeout (yang
  // closure-nya bisa stale) untuk mencegah kartu masuk setelah game selesai.
  const gameOverRef = useRef(gameOver)
  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  // pairs dibaca via ref supaya effect inisialisasi TIDAK ikut jalan kalau
  // parent mengirim referensi array `pairs` baru (mis. akibat revalidatePath
  // saat menyimpan skor) — kalau ikut jalan, progress ter-reset di tengah
  // layar hasil & kartu "muncul lagi". Isi kata untuk satu lesson tidak
  // pernah berubah, jadi memakai snapshot ref aman.
  const pairsRef = useRef(pairs)

  // Acak susunan kartu sekali saat mount, bukan saat referensi pairs berubah
  // (mis. akibat revalidatePath saat menyimpan skor). Di rAF (bukan langsung di
  // body effect) supaya lolos aturan react-hooks "no setState sinkron dalam
  // effect", sambil tetap menjaga SSR/first-paint deterministik.
  useEffect(() => {
    const currentPairs = pairsRef.current
    const queue = buildQueue(currentPairs, REPEATS_PER_WORD, shuffle)
    const { active, waiting: rest } = initialSlots(queue, currentPairs.length)
    const applyShuffledState = () => {
      setSlots({ active, waiting: rest, rightOrder: shuffle(active) })
      setMatchedInstanceIds(new Set())
      setMatchCount(0)
      setPendingClear(new Set())
    }
    const id = requestAnimationFrame(applyShuffledState)
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (gameOver || !gameStarted) return
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [gameOver, gameStarted])

  // Saat game berakhir, batalkan semua penggantian kartu yang masih tertunda —
  // mencegah kartu antrian "muncul lagi" di belakang layar hasil.
  useEffect(() => {
    if (!gameOver) return
    const timers = replaceTimers.current
    for (const t of timers) clearTimeout(t)
    timers.clear()
  }, [gameOver])

  // Bersihkan timer yang masih menggantung saat komponen unmount.
  useEffect(() => {
    const timers = replaceTimers.current
    return () => {
      for (const t of timers) clearTimeout(t)
      timers.clear()
    }
  }, [])

  // Feedback merah sebentar, lalu reset pilihan.
  useEffect(() => {
    if (!wrongPair) return
    const timeout = setTimeout(() => {
      setWrongPair(null)
      setSelectedLeft(null)
      setSelectedRight(null)
    }, 600)
    return () => clearTimeout(timeout)
  }, [wrongPair])

  // Simpan hasil ke server sekali per ronde saat game berakhir.
  // setSubmit({ status: 'saving' }) diletakkan di dalam startTransition via
  // requestAnimationFrame supaya tidak dipanggil sinkron di dalam body effect
  // (melanggar react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!gameOver || !lessonId || submit.status !== 'idle') return
    const rafId = requestAnimationFrame(() => {
      setSubmit({ status: 'saving' })
      startTransition(async () => {
        try {
          const result = await submitScore(lessonId, correctCount, attempts)
          if (result.ok) {
            setSubmit({ status: 'saved', result })
            // Tampilkan modal reward jika ada goal yang baru diselesaikan
            if (result.goalsCompleted.length > 0) {
              setShowRewardModal(true)
            }
          } else {
            setSubmit({ status: 'error', message: result.error })
          }
        } catch {
          setSubmit({ status: 'error', message: 'Gagal menyimpan skor' })
        }
      })
    })
    return () => cancelAnimationFrame(rafId)
  }, [gameOver, lessonId, submit.status, correctCount, attempts])

  const { score: localScore, accuracy } = computeScore(
    correctCount,
    attempts,
    totalMatches,
    allMatched,
  )

  // Ganti slot yang cocok dengan kartu antrian berikutnya, setelah jeda.
  // Dipisah dari evaluate() supaya jeda tidak memblokir interaksi lain.
  // Seluruh state (active/waiting/rightOrder) dibaca & ditulis dalam SATU
  // updater atomik — mencegah race condition kalau dua slot cocok berdekatan.
  function scheduleReplacement(leftInstanceId: string, rightInstanceId: string) {
    setPendingClear((prev) => new Set(prev).add(leftInstanceId).add(rightInstanceId))
    const timer = setTimeout(() => {
      replaceTimers.current.delete(timer)
      // Game sudah selesai sebelum jeda ini berakhir — jangan masukkan kartu
      // baru (mencegah kartu "muncul lagi" di belakang layar hasil).
      if (gameOverRef.current) {
        setPendingClear((prev) => {
          const next = new Set(prev)
          next.delete(leftInstanceId)
          next.delete(rightInstanceId)
          return next
        })
        return
      }
      setSlots((prev) => {
        const slotIndex = prev.active.findIndex((c) => c?.instanceId === leftInstanceId)
        if (slotIndex === -1) return prev

        // EXCLUDE the card currently being replaced from the conflict set
        // (to allow picking the next repeat of this word, which is leaving the screen)
        const activeWithoutCurrent = prev.active.filter(
          (c) => c !== null && c.instanceId !== leftInstanceId
        )
        const replacementIndex = pickReplacement(activeWithoutCurrent, prev.waiting)

        if (replacementIndex === -1) {
          // Antrian habis — slot ini kosong permanen (sisa kartu sudah semua main).
          const nextActive = [...prev.active]
          nextActive[slotIndex] = null
          const nextRightOrder = [...prev.rightOrder]
          const rightSlotIndex = prev.rightOrder.findIndex((c) => c?.instanceId === rightInstanceId)
          if (rightSlotIndex !== -1) nextRightOrder[rightSlotIndex] = null
          return { ...prev, active: nextActive, rightOrder: nextRightOrder }
        }

        const replacement = prev.waiting[replacementIndex]
        const nextActive = [...prev.active]
        nextActive[slotIndex] = replacement

        // Kartu baru masuk ke posisi kanan yang SAMA dengan kartu yang baru
        // cocok (bukan di-shuffle ulang) — supaya kartu lain yang belum
        // dicocokkan tidak berpindah posisi & membingungkan pemain.
        const rightSlotIndex = prev.rightOrder.findIndex((c) => c?.instanceId === rightInstanceId)
        const nextRightOrder = [...prev.rightOrder]
        if (rightSlotIndex !== -1) nextRightOrder[rightSlotIndex] = replacement

        return {
          active: nextActive,
          waiting: prev.waiting.filter((_, i) => i !== replacementIndex),
          rightOrder: nextRightOrder,
        }
      })
      setPendingClear((prev) => {
        const next = new Set(prev)
        next.delete(leftInstanceId)
        next.delete(rightInstanceId)
        return next
      })
    }, REPLACE_DELAY_MS)
    replaceTimers.current.add(timer)
  }

  function evaluate(leftInstanceId: string, rightInstanceId: string) {
    setAttempts((n) => n + 1)
    const currentSlots = slotsRef.current
    const leftCard = currentSlots.active.find((c) => c?.instanceId === leftInstanceId)
    const rightCard = currentSlots.rightOrder.find((c) => c?.instanceId === rightInstanceId)

    // Match VALID hanya jika kiri & kanan instance yang SAMA PERSIS (lihat
    // isValidMatch) — mencegah dua pasang duplikat saling ter-solve.
    if (isValidMatch(leftCard, rightCard)) {
      setMatchCount((n) => n + 1)
      setMatchedInstanceIds((prev) => new Set(prev).add(leftInstanceId).add(rightInstanceId))
      setSuccessIds((prev) => new Set(prev).add(leftInstanceId).add(rightInstanceId))
      setTimeout(() => {
        setSuccessIds((prev) => {
          const next = new Set(prev)
          next.delete(leftInstanceId)
          next.delete(rightInstanceId)
          return next
        })
      }, 500)
      setSelectedLeft(null)
      setSelectedRight(null)
      // Kartu terakhir keseluruhan: tidak perlu jeda, langsung ke layar hasil.
      const isLastOverall = correctCount + 1 === totalMatches
      if (!isLastOverall) scheduleReplacement(leftInstanceId, rightInstanceId)
    } else {
      setWrongPair({ left: leftInstanceId, right: rightInstanceId })
    }
  }

  function isMatchable(instanceId: string): boolean {
    return (
      !gameOver &&
      !wrongPair &&
      !matchedInstanceIds.has(instanceId) &&
      !pendingClear.has(instanceId) &&
      !successIds.has(instanceId)
    )
  }

  function handleLeftClick(instanceId: string) {
    if (!isMatchable(instanceId)) return
    if (!gameStarted) setGameStarted(true)
    setSelectedLeft(instanceId)
    if (selectedRight !== null) evaluate(instanceId, selectedRight)
  }

  function handleRightClick(instanceId: string) {
    if (!isMatchable(instanceId)) return
    if (!gameStarted) setGameStarted(true)
    setSelectedRight(instanceId)
    if (selectedLeft !== null) evaluate(selectedLeft, instanceId)
  }

  // Isi confettiParticles sekali saat allMatched berubah menjadi true.
  // Dibungkus rAF supaya setState tidak dipanggil sinkron di body effect.
  useEffect(() => {
    if (!allMatched) return
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4899', '#8b5cf6']
    const rafId = requestAnimationFrame(() => {
      setConfettiParticles(Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.5}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 5,
        drift: `${Math.random() * 140 - 70}px`,
        duration: `${Math.random() * 1.2 + 1.2}s`,
      })))
    })
    return () => cancelAnimationFrame(rafId)
  }, [allMatched])

  const base =
    'flex min-h-[3.8rem] w-full items-center justify-center rounded-2xl border-2 border-b-4 px-4 py-3 text-base sm:text-lg lg:text-xl font-black transition-all duration-150 select-none shadow-sm text-center break-words'

  function buttonClass(instanceId: string | undefined, side: 'left' | 'right') {
    if (!instanceId) return `${base} invisible pointer-events-none`
    const selected = side === 'left' ? selectedLeft === instanceId : selectedRight === instanceId
    const isWrong = wrongPair !== null && wrongPair[side] === instanceId
    const isSuccess = successIds.has(instanceId)
    const isMatched = (matchedInstanceIds.has(instanceId) || pendingClear.has(instanceId)) && !isSuccess

    if (isMatched) {
      return `${base} invisible pointer-events-none`
    }
    if (isSuccess) {
      return `${base} border-green-600 bg-green-500/10 text-green-700 border-b-2 translate-y-[2px] animate-success-pop`
    }
    if (isWrong) {
      return `${base} border-red-500 bg-red-500/10 text-red-700 border-b-2 translate-y-[2px] animate-shake`
    }
    if (selected) {
      return `${base} border-brand-500 bg-brand-500/10 text-brand-700 border-b-2 translate-y-[2px]`
    }
    return `${base} border-zinc-700 bg-zinc-800 text-zinc-100 hover:border-brand-500/60 hover:-translate-y-[2px] active:translate-y-[2px] active:border-b-2 cursor-pointer`
  }

  // Label status antrian, diumumkan ke screen reader saat kartu berganti.
  const remainingInQueue = waiting.length
  const queueStatusLabel = useMemo(
    () => `${correctCount}/${totalMatches} pasangan cocok · ${remainingInQueue} menunggu di antrian`,
    [correctCount, totalMatches, remainingInQueue],
  )

  if (gameOver) {
    const finalScore = submit.status === 'saved' ? submit.result.score : localScore
    const accuracyPct = attempts > 0 ? Math.round(accuracy * 100) : 0
    const saving = submit.status === 'saving'

    const finalXp = submit.status === 'saved' ? submit.result.totalXp : userXp + (lessonId ? (allMatched ? localScore : 0) : 0)
    const currentLevel = levelForXp(finalXp)

    return (
      <>
      {/* Modal reward goal harian — muncul sebelum layar skor jika ada goal selesai */}
      {showRewardModal && submit.status === 'saved' && submit.result.goalsCompleted.length > 0 && (
        <GoalRewardModal
          rewards={submit.result.goalsCompleted}
          onClose={() => setShowRewardModal(false)}
        />
      )}
      <div className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-6 overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-800/40 p-8 text-center backdrop-blur-md shadow-2xl lg:max-w-lg">
        <style>{`
          .confetti-particle {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: confetti-fall 2.5s ease-out forwards;
            pointer-events: none;
          }
          @keyframes confetti-fall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(350px) translateX(var(--drift, 40px)) rotate(360deg);
              opacity: 0;
            }
          }
        `}</style>

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
          <h2 className={`font-display text-3xl font-extrabold tracking-tight ${allMatched ? 'text-brand-500' : 'text-red-500'}`}>
            {allMatched ? 'Luar Biasa!' : 'Waktu Habis'}
          </h2>
          <p className="text-xs font-semibold text-zinc-400">
            Lexi Level {currentLevel}
          </p>
        </div>

        {/* Skor utama */}
        <div className="flex flex-col items-center rounded-2xl bg-zinc-900/50 px-6 py-3 border border-zinc-700/40 min-w-[140px] shadow-sm">
          {lessonId ? (
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
            <span className="text-lg" aria-hidden>🎯</span>
            <dd className="text-lg font-black tabular-nums text-zinc-100">{accuracyPct}%</dd>
            <dt className="text-[11px] font-bold text-zinc-500">Akurasi</dt>
          </div>
        </dl>

        {/* Status simpan — halus, tidak mengganggu */}
        {lessonId && (
          <p className="min-h-[1.25rem] text-xs" aria-live="polite">
            {saving && <span className="text-zinc-500 animate-pulse">Menyimpan skor...</span>}
            {submit.status === 'saved' && (
              <span className="font-semibold text-brand-500">
                Tersimpan · Total XP {submit.result.totalXp.toLocaleString('id-ID')}
                {submit.result.completed &&
                  submit.result.xpGain < submit.result.score && (
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
          onClick={() => router.push('/learn')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-brand-700 bg-brand-500 px-6 py-4 text-base font-black text-zinc-900 transition-all hover:bg-brand-400 hover:-translate-y-[2px] active:translate-y-[2px] active:border-b-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          Lanjut ke Journey
          <ArrowRight size={20} aria-hidden />
        </button>
      </div>
      </>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes success-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); filter: brightness(1.15); }
          100% { transform: scale(1); }
        }
        .animate-success-pop {
          animation: success-pop 0.3s cubic-bezier(.175, .885, .32, 1.275);
        }
        @keyframes pulse-red {
          0%, 100% { opacity: 1; border-color: rgba(239, 68, 68, 0.8); box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
          50% { opacity: 0.6; border-color: transparent; box-shadow: none; }
        }
        .animate-pulse-red {
          animation: pulse-red 1s infinite;
        }
      `}</style>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-black text-zinc-100 flex items-center gap-2">
          ⚡ Match Madness
        </h1>
        <div
          className={`flex items-center gap-1.5 rounded-2xl px-4 py-1.5 font-mono text-base font-black tracking-tight tabular-nums transition-all border ${
            timeLeft <= 10
              ? 'bg-red-500/20 text-red-500 border-red-500 animate-pulse-red'
              : 'bg-zinc-800 border-zinc-700 text-zinc-300'
          }`}
          role="timer"
          aria-label={`Sisa waktu: ${timeLeft} detik`}
        >
          <span className={timeLeft <= 10 ? 'animate-bounce' : ''}>⏱️</span>
          {timeLeft}s
        </div>
      </div>

      <div className="relative mb-6 h-3.5 w-full overflow-hidden rounded-full border border-zinc-700 bg-zinc-900/60 p-[2px] shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            timeLeft <= 10
              ? 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse'
              : timeLeft <= 25
              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
              : 'bg-gradient-to-r from-brand-400 to-brand-500'
          }`}
          style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
        />
      </div>

      {/* Diumumkan ke screen reader tiap kali komposisi antrian berubah,
          tanpa mengganggu (aria-live polite, bukan visual). */}
      <p className="sr-only" aria-live="polite">
        {queueStatusLabel}
      </p>

      {!gameStarted && (
        <div 
          className="mb-4 animate-pulse rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-brand-400"
          role="alert"
        >
          👆 Klik salah satu kartu untuk memulai!
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <div className="flex flex-col gap-3">
          {activeSlots.map((card, idx) => (
            <button
              key={card?.instanceId ?? `empty-left-${idx}`}
              type="button"
              disabled={!card}
              onClick={() => card && handleLeftClick(card.instanceId)}
              className={buttonClass(card?.instanceId, 'left')}
            >
              {card?.indonesian}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rightOrder.map((card, idx) => (
            <button
              key={card?.instanceId ?? `empty-right-${idx}`}
              type="button"
              disabled={!card}
              onClick={() => card && handleRightClick(card.instanceId)}
              className={buttonClass(card?.instanceId, 'right')}
            >
              {card?.english}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-center text-xs font-semibold text-zinc-500 bg-zinc-900/40 py-2 rounded-xl border border-zinc-800/60">
        Cocok: <span className="font-black text-brand-500">{correctCount}</span>/{totalMatches}
        {remainingInQueue > 0 && ` · ${remainingInQueue} menunggu`}
      </p>
    </div>
  )
}
