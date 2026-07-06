'use client'

import { ArrowLeft, ArrowRight, CheckCircle2, FlaskConical, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  acceptRecommendation,
  startPlacement,
  submitPlacement,
  type PlacementQuestion,
  type SubmitPlacementResult,
} from './actions'

type Phase =
  | { name: 'intro' }
  | { name: 'loading' }
  | { name: 'quiz'; sessionId: string; questions: PlacementQuestion[] }
  | { name: 'result'; sessionId: string; result: Extract<SubmitPlacementResult, { ok: true }> }
  | { name: 'error'; message: string }

export default function PlacementTest({
  targetLevelOrder,
  levelLabel,
}: {
  targetLevelOrder: number
  levelLabel: string
}) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>({ name: 'intro' })
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [busy, setBusy] = useState(false)

  async function begin() {
    setPhase({ name: 'loading' })
    const result = await startPlacement(targetLevelOrder)
    if (!result.ok) {
      setPhase({ name: 'error', message: result.error })
      return
    }
    setAnswers(new Array(result.questions.length).fill(null))
    setCurrent(0)
    setPhase({ name: 'quiz', sessionId: result.sessionId, questions: result.questions })
  }

  async function submit(sessionId: string) {
    setBusy(true)
    const result = await submitPlacement(sessionId, answers)
    setBusy(false)
    if (!result.ok) {
      setPhase({ name: 'error', message: result.error })
      return
    }
    setPhase({ name: 'result', sessionId, result })
  }

  async function accept(sessionId: string) {
    setBusy(true)
    const result = await acceptRecommendation(sessionId)
    setBusy(false)
    if (!result.ok) {
      setPhase({ name: 'error', message: result.error })
      return
    }
    router.push('/learn')
    router.refresh()
  }

  if (phase.name === 'intro' || phase.name === 'loading') {
    return (
      <Card>
        <FlaskConical size={40} className="text-brand-600" aria-hidden />
        <h1 className="text-xl font-bold text-zinc-100">Tes Penempatan — {levelLabel}</h1>
        <p className="text-sm text-zinc-400">
          12 soal pilihan ganda, tanpa batas waktu. Benar minimal 9 untuk mulai
          dari tingkat ini. Santai saja — kalau belum lulus, kami sarankan
          tingkat yang pas.
        </p>
        <button
          type="button"
          disabled={phase.name === 'loading'}
          onClick={begin}
          className="mt-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
        >
          {phase.name === 'loading' ? 'Menyiapkan soal…' : 'Mulai Tes'}
        </button>
        <Link href="/onboarding" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Kembali pilih tingkat
        </Link>
      </Card>
    )
  }

  if (phase.name === 'error') {
    return (
      <Card>
        <XCircle size={40} className="text-red-600" aria-hidden />
        <p className="text-sm text-red-700">{phase.message}</p>
        <Link
          href="/onboarding"
          className="mt-2 rounded-xl border border-zinc-600 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          ← Kembali pilih tingkat
        </Link>
      </Card>
    )
  }

  if (phase.name === 'quiz') {
    const { questions, sessionId } = phase
    const question = questions[current]
    const isLast = current === questions.length - 1
    const allAnswered = answers.every((a) => a !== null)

    return (
      <Card wide>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-bold text-zinc-400">
            {current + 1}/{questions.length}
          </span>
          <span className="text-xs text-zinc-500">Tes Penempatan {levelLabel}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-700">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-zinc-400">Apa bahasa Inggris dari…</p>
        <p className="text-3xl font-black text-zinc-100">{question.prompt}</p>

        <div className="mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                setAnswers((prev) => prev.map((a, i) => (i === current ? option : a)))
              }
              className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-colors ${
                answers[current] === option
                  ? 'border-brand-500 bg-brand-500/10 text-brand-700'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:border-brand-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-4 flex w-full items-center justify-between">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
            className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-30"
          >
            <ArrowLeft size={16} aria-hidden /> Sebelumnya
          </button>
          {isLast ? (
            <button
              type="button"
              disabled={!allAnswered || busy}
              onClick={() => submit(sessionId)}
              className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
            >
              {busy ? 'Menilai…' : 'Kirim Jawaban'}
            </button>
          ) : (
            <button
              type="button"
              disabled={answers[current] === null}
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-1 rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-600 disabled:opacity-40"
            >
              Berikutnya <ArrowRight size={16} aria-hidden />
            </button>
          )}
        </div>
      </Card>
    )
  }

  // phase.name === 'result'
  const { result, sessionId } = phase
  return (
    <Card>
      {result.passed ? (
        <CheckCircle2 size={40} className="text-brand-600" aria-hidden />
      ) : (
        <XCircle size={40} className="text-amber-600" aria-hidden />
      )}
      <h1 className="text-xl font-bold text-zinc-100">
        {result.passed ? 'Lulus! 🎉' : 'Belum lulus'}
      </h1>
      <p className="text-4xl font-black text-zinc-100">
        {result.score}
        <span className="text-xl font-bold text-zinc-500">/{result.total}</span>
      </p>

      {result.passed ? (
        <>
          <p className="text-sm text-zinc-400">
            Kamu mulai dari tingkat {levelLabel}. Tingkat di bawahnya terbuka
            bebas untuk review.
          </p>
          <button
            type="button"
            onClick={() => {
              router.push('/learn')
              router.refresh()
            }}
            className="mt-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Mulai Belajar →
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-zinc-400">
            {result.recommendation
              ? `Saran kami: mulai dari tingkat ${result.recommendation.label}.`
              : 'Coba lagi kapan saja.'}
          </p>
          <div className="mt-2 flex w-full flex-col gap-2">
            {result.recommendation && (
              <button
                type="button"
                disabled={busy}
                onClick={() => accept(sessionId)}
                className="w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
              >
                Mulai dari {result.recommendation.label}
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={begin}
              className="w-full rounded-xl border border-zinc-600 px-6 py-3 font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              Ulangi Tes
            </button>
          </div>
        </>
      )}
    </Card>
  )
}

function Card({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={`flex w-full ${wide ? 'max-w-lg' : 'max-w-md'} flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-800/50 p-8 text-center`}
    >
      {children}
    </div>
  )
}
