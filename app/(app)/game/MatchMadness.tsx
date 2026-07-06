'use client'

import { startTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitScore, type SubmitScoreResult } from './actions'
import { GAME_DURATION, POINTS_PER_MATCH, computeScore } from './scoring'

export type WordPair = { id: string; english: string; indonesian: string }

type SubmitState =
  | { status: 'idle' | 'saving' }
  | { status: 'saved'; result: Extract<SubmitScoreResult, { ok: true }> }
  | { status: 'error'; message: string }

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
  nextLessonId = null,
}: {
  pairs: WordPair[]
  lessonId?: string
  nextLessonId?: string | null
}) {
  const router = useRouter()
  // Kolom kanan diacak di effect, bukan saat render, agar hasil SSR dan
  // render pertama di client identik (menghindari hydration mismatch).
  const [rightOrder, setRightOrder] = useState<WordPair[]>(pairs)
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [attempts, setAttempts] = useState(0)
  const [round, setRound] = useState(0)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })

  const allMatched = pairs.length > 0 && matchedIds.size === pairs.length
  const gameOver = allMatched || timeLeft === 0

  useEffect(() => {
    setRightOrder(shuffle(pairs))
  }, [pairs, round])

  useEffect(() => {
    if (gameOver) return
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [gameOver, round])

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

  const correctCount = matchedIds.size

  // Simpan hasil ke server sekali per ronde saat game berakhir.
  useEffect(() => {
    if (!gameOver || !lessonId || submit.status !== 'idle') return
    setSubmit({ status: 'saving' })
    startTransition(async () => {
      try {
        const result = await submitScore(lessonId, correctCount, attempts)
        if (result.ok) {
          setSubmit({ status: 'saved', result })
        } else {
          setSubmit({ status: 'error', message: result.error })
        }
      } catch {
        setSubmit({ status: 'error', message: 'Gagal menyimpan skor' })
      }
    })
  }, [gameOver, lessonId, submit.status, correctCount, attempts])

  const { score: localScore, accuracy } = computeScore(correctCount, attempts, allMatched)

  function evaluate(leftId: string, rightId: string) {
    setAttempts((n) => n + 1)
    if (leftId === rightId) {
      setMatchedIds((prev) => new Set(prev).add(leftId))
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setWrongPair({ left: leftId, right: rightId })
    }
  }

  function handleLeftClick(id: string) {
    if (gameOver || wrongPair || matchedIds.has(id)) return
    setSelectedLeft(id)
    if (selectedRight !== null) evaluate(id, selectedRight)
  }

  function handleRightClick(id: string) {
    if (gameOver || wrongPair || matchedIds.has(id)) return
    setSelectedRight(id)
    if (selectedLeft !== null) evaluate(selectedLeft, id)
  }

  function playAgain() {
    setSelectedLeft(null)
    setSelectedRight(null)
    setMatchedIds(new Set())
    setWrongPair(null)
    setTimeLeft(GAME_DURATION)
    setAttempts(0)
    setSubmit({ status: 'idle' })
    setRound((r) => r + 1)
  }

  function buttonClass(id: string, side: 'left' | 'right') {
    const selected = side === 'left' ? selectedLeft === id : selectedRight === id
    const isWrong = wrongPair !== null && wrongPair[side] === id

    const base =
      'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium transition-colors duration-150 select-none'
    if (matchedIds.has(id)) {
      return `${base} invisible`
    }
    if (isWrong) {
      return `${base} border-red-500 bg-red-500/10 text-red-700`
    }
    if (selected) {
      return `${base} border-brand-500 bg-brand-500/10 text-brand-700`
    }
    return `${base} border-zinc-700 bg-zinc-800 text-zinc-100 hover:border-brand-500 hover:bg-zinc-700/60 cursor-pointer`
  }

  if (gameOver) {
    const finalScore = submit.status === 'saved' ? submit.result.score : localScore
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-800/50 p-8 text-center">
        <h2 className="text-2xl font-bold">
          {allMatched ? 'Semua cocok! 🎉' : 'Waktu habis! ⏰'}
        </h2>
        <div className="flex flex-col gap-1 text-zinc-300">
          <p className="text-4xl font-extrabold text-brand-600">{finalScore}</p>
          <p className="text-sm text-zinc-400">
            {correctCount} × {POINTS_PER_MATCH} poin
            {allMatched && ' + bonus akurasi'}
          </p>
        </div>
        <p className="text-zinc-300">
          Akurasi:{' '}
          <span className="font-semibold">
            {attempts > 0 ? Math.round(accuracy * 100) : 0}%
          </span>{' '}
          ({correctCount}/{attempts} percobaan)
        </p>

        {lessonId && (
          <p className="text-sm" aria-live="polite">
            {submit.status === 'saving' && (
              <span className="text-zinc-400">Menyimpan skor…</span>
            )}
            {submit.status === 'saved' && (
              <span className="text-brand-600">
                Tersimpan ✓ · Total XP: {submit.result.totalXp}
                {submit.result.completed && ' · Lesson selesai!'}
              </span>
            )}
            {submit.status === 'error' && (
              <span className="text-red-600">{submit.message}</span>
            )}
          </p>
        )}

        {/* Tombol navigasi */}
        <div className="mt-2 flex w-full flex-col gap-2">
          {nextLessonId && (
            <button
              type="button"
              onClick={() => router.push(`/game/${nextLessonId}`)}
              className="w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Lesson Berikutnya →
            </button>
          )}
          <button
            type="button"
            onClick={playAgain}
            className="w-full rounded-xl border border-zinc-600 bg-zinc-800 px-6 py-3 font-semibold text-zinc-200 transition-colors hover:bg-zinc-700"
          >
            Main Lagi
          </button>
          <button
            type="button"
            onClick={() => router.push('/learn')}
            className="w-full rounded-xl px-6 py-3 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            ← Kembali ke Journey
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Match Madness</h1>
        <div
          className={`rounded-lg px-3 py-1 font-mono text-lg font-bold tabular-nums ${
            timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-zinc-800 text-zinc-300'
          }`}
          role="timer"
          aria-label={`Sisa waktu: ${timeLeft} detik`}
        >
          {timeLeft}s
        </div>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-zinc-700">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {pairs.map((pair) => (
            <button
              key={pair.id}
              type="button"
              onClick={() => handleLeftClick(pair.id)}
              className={buttonClass(pair.id, 'left')}
            >
              {pair.indonesian}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rightOrder.map((pair) => (
            <button
              key={pair.id}
              type="button"
              onClick={() => handleRightClick(pair.id)}
              className={buttonClass(pair.id, 'right')}
            >
              {pair.english}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-zinc-400">
        Skor: <span className="font-semibold text-zinc-200">{correctCount * POINTS_PER_MATCH}</span>
        {' · '}Cocok: {correctCount}/{pairs.length}
      </p>
    </div>
  )
}
