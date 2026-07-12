'use client'

import { startTransition, useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { submitScore } from './actions'
import { GAME_DURATION, REPEATS_PER_WORD, computeScore } from './scoring'
import { buildQueue, initialSlots, pickReplacement, isValidMatch, type CardInstance } from './queue'
import MatchCard, { type MatchCardState } from './MatchCard'
import ResultScreen, { type SubmitState } from './ResultScreen'
import { playSfx } from '@/lib/sfx'

export type WordPair = { id: string; english: string; indonesian: string }

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
  startToken,
}: {
  pairs: WordPair[]
  lessonId?: string
  userXp?: number
  /** Token bukti-mulai dari server — wajib untuk mode lesson (simpan skor). */
  startToken?: string
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

  // Timer berbasis deadline wall-clock, BUKAN decrement per-interval.
  // setInterval di-throttle browser saat tab di-background — dengan decrement,
  // pindah tab = waktu berhenti (bisa dipakai "pause" untuk berpikir).
  // Deadline dihitung sekali saat mulai; tick hanya membaca sisa waktu nyata.
  const deadlineRef = useRef<number | null>(null)
  useEffect(() => {
    if (gameOver || !gameStarted) return
    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + GAME_DURATION * 1000
    }
    const tick = () =>
      setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current! - Date.now()) / 1000)))
    tick()
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [gameOver, gameStarted])

  // Fanfare menang / nada kalah saat layar hasil muncul. Sedikit ditunda agar
  // tidak bertumpuk dengan sfx 'correct' dari match terakhir.
  useEffect(() => {
    if (!gameOver) return
    const t = setTimeout(() => playSfx(allMatched ? 'win' : 'lose'), 350)
    return () => clearTimeout(t)
  }, [gameOver, allMatched])

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
    if (!gameOver || !lessonId || !startToken || submit.status !== 'idle') return
    const rafId = requestAnimationFrame(() => {
      setSubmit({ status: 'saving' })
      startTransition(async () => {
        try {
          const result = await submitScore(lessonId, correctCount, attempts, startToken)
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
  }, [gameOver, lessonId, startToken, submit.status, correctCount, attempts])

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
      playSfx('correct')
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
      playSfx('wrong')
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

  // Pemetaan state kartu — prioritas: matched (hilang) > success (hijau) >
  // wrong (merah) > selected > idle. Tampilan per state ada di MatchCard.
  function cardStateOf(instanceId: string | undefined, side: 'left' | 'right'): MatchCardState {
    if (!instanceId) return 'matched' // slot kosong: tak terlihat
    const isSuccess = successIds.has(instanceId)
    if ((matchedInstanceIds.has(instanceId) || pendingClear.has(instanceId)) && !isSuccess) {
      return 'matched'
    }
    if (isSuccess) return 'success'
    if (wrongPair !== null && wrongPair[side] === instanceId) return 'wrong'
    const selected = side === 'left' ? selectedLeft === instanceId : selectedRight === instanceId
    return selected ? 'selected' : 'idle'
  }

  // Label status antrian, diumumkan ke screen reader saat kartu berganti.
  const remainingInQueue = waiting.length
  const queueStatusLabel = useMemo(
    () => `${correctCount}/${totalMatches} pasangan cocok · ${remainingInQueue} menunggu di antrian`,
    [correctCount, totalMatches, remainingInQueue],
  )

  if (gameOver) {
    return (
      <ResultScreen
        allMatched={allMatched}
        isLesson={Boolean(lessonId)}
        localScore={localScore}
        accuracy={accuracy}
        attempts={attempts}
        correctCount={correctCount}
        totalMatches={totalMatches}
        userXp={userXp}
        submit={submit}
        showRewardModal={showRewardModal}
        onCloseRewardModal={() => setShowRewardModal(false)}
        onExit={() => router.push("/learn")}
      />
    )
  }

  // Keyframes game (shake/success-pop/pulse-red/confetti) ada di globals.css.
  return (
    <div className="mx-auto w-full max-w-2xl">
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
            <MatchCard
              key={card?.instanceId ?? `empty-left-${idx}`}
              label={card?.indonesian}
              state={cardStateOf(card?.instanceId, 'left')}
              onClick={() => card && handleLeftClick(card.instanceId)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rightOrder.map((card, idx) => (
            <MatchCard
              key={card?.instanceId ?? `empty-right-${idx}`}
              label={card?.english}
              state={cardStateOf(card?.instanceId, 'right')}
              onClick={() => card && handleRightClick(card.instanceId)}
            />
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
