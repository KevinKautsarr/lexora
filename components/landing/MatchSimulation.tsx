'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, Target, Zap } from 'lucide-react'

interface Card {
  id: string
  text: string
  type: 'en' | 'id'
  matchId: string
}

const INITIAL_CARDS: Card[] = [
  { id: 'id-3', text: 'Senang',   type: 'id', matchId: '3' },
  { id: 'id-1', text: 'Berlari',  type: 'id', matchId: '1' },
  { id: 'id-4', text: 'Sekolah',  type: 'id', matchId: '4' },
  { id: 'id-2', text: 'Buku',     type: 'id', matchId: '2' },
  { id: 'en-1', text: 'Run',      type: 'en', matchId: '1' },
  { id: 'en-2', text: 'Book',     type: 'en', matchId: '2' },
  { id: 'en-3', text: 'Happy',    type: 'en', matchId: '3' },
  { id: 'en-4', text: 'School',   type: 'en', matchId: '4' },
]

const TOTAL_PAIRS = INITIAL_CARDS.length / 2
const GAME_DURATION = 60

// Base card class — mirrors real MatchMadness
const BASE =
  'flex min-h-[3.2rem] w-full items-center justify-center rounded-2xl border-2 border-b-4 px-3 py-2.5 text-sm font-black transition-all duration-150 select-none shadow-sm text-center break-words'

function cardClass(
  isMatched: boolean,
  isWrong: boolean,
  isSuccess: boolean,
  isSelected: boolean,
) {
  if (isMatched)  return `${BASE} invisible pointer-events-none`
  if (isSuccess)  return `${BASE} border-green-600 bg-green-500/10 text-green-700 border-b-2 translate-y-[2px]`
  if (isWrong)    return `${BASE} border-red-500 bg-red-500/10 text-red-700 border-b-2 translate-y-[2px] animate-shake`
  if (isSelected) return `${BASE} border-brand-500 bg-brand-500/10 text-brand-700 border-b-2 translate-y-[2px]`
  return `${BASE} border-zinc-700 bg-zinc-800 text-zinc-100 hover:border-brand-500/60 hover:-translate-y-[2px] active:translate-y-[2px] active:border-b-2 cursor-pointer`
}

export default function MatchSimulation() {
  const [selectedLeft, setSelectedLeft]   = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matchedIds, setMatchedIds]       = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair]         = useState<{ left: string; right: string } | null>(null)
  const [successIds, setSuccessIds]       = useState<Set<string>>(new Set())
  const [score, setScore]                 = useState(0)
  const [timeLeft, setTimeLeft]           = useState(GAME_DURATION)
  const [started, setStarted]             = useState(false)

  const leftCards  = INITIAL_CARDS.filter((c) => c.type === 'id')
  const rightCards = INITIAL_CARDS.filter((c) => c.type === 'en')

  const allMatched = matchedIds.size === TOTAL_PAIRS
  const gameOver   = allMatched || timeLeft === 0

  // Timer
  useEffect(() => {
    if (!started || gameOver) return
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [started, gameOver])

  // Wrong pair reset
  useEffect(() => {
    if (!wrongPair) return
    const id = setTimeout(() => {
      setWrongPair(null)
      setSelectedLeft(null)
      setSelectedRight(null)
    }, 600)
    return () => clearTimeout(id)
  }, [wrongPair])

  // Evaluasi dipanggil langsung dari handler klik (bukan effect yang bereaksi
  // pada state pilihan) — menyamai pola MatchMadness asli, dan menghindari
  // setState sinkron di effect body.
  function evaluate(leftId: string, rightId: string) {
    const left  = leftCards.find((c) => c.id === leftId)!
    const right = rightCards.find((c) => c.id === rightId)!
    if (left.matchId === right.matchId) {
      setMatchedIds((prev) => new Set(prev).add(left.matchId))
      setSuccessIds((prev) => new Set(prev).add(left.id).add(right.id))
      setScore((s) => s + 20)
      setTimeout(() => {
        setSuccessIds((prev) => {
          const n = new Set(prev); n.delete(left.id); n.delete(right.id); return n
        })
      }, 500)
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setWrongPair({ left: leftId, right: rightId })
    }
  }

  const handleReset = () => {
    setMatchedIds(new Set()); setSelectedLeft(null); setSelectedRight(null)
    setWrongPair(null); setSuccessIds(new Set()); setScore(0)
    setTimeLeft(GAME_DURATION); setStarted(false)
  }

  const handleLeftClick = (id: string) => {
    if (gameOver || wrongPair) return
    if (!started) setStarted(true)
    setSelectedLeft(id)
    if (selectedRight) evaluate(id, selectedRight)
  }

  const handleRightClick = (id: string) => {
    if (gameOver || wrongPair) return
    if (!started) setStarted(true)
    setSelectedRight(id)
    if (selectedLeft) evaluate(selectedLeft, id)
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-700/60 bg-zinc-800/80 p-5 shadow-xl backdrop-blur-md">
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-6px); }
          40%,80%  { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* Header — matches real game */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-black text-zinc-100 flex items-center gap-1.5">
          ⚡ Match Madness
        </h3>
        <div
          className={`flex items-center gap-1.5 rounded-2xl px-3 py-1 font-mono text-sm font-black tabular-nums border transition-all ${
            timeLeft <= 10
              ? 'bg-red-500/20 text-red-500 border-red-500 animate-pulse'
              : 'bg-zinc-800 border-zinc-700 text-zinc-300'
          }`}
        >
          <span className={timeLeft <= 10 ? 'animate-bounce' : ''}>⏱️</span>
          {timeLeft}s
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-4 h-3 w-full overflow-hidden rounded-full border border-zinc-700 bg-zinc-900/60 p-[2px]">
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

      {gameOver ? (
        /* Result screen */
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            allMatched ? 'bg-brand-500/20' : 'bg-red-500/20'
          }`}>
            {allMatched ? '🎉' : '⏰'}
          </div>
          <div>
            <p className={`text-lg font-black ${allMatched ? 'text-brand-500' : 'text-red-500'}`}>
              {allMatched ? 'Luar Biasa!' : 'Waktu Habis'}
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="flex flex-col items-center rounded-2xl bg-zinc-900/50 px-4 py-2 border border-zinc-700">
                <span className="flex items-center gap-1 text-xl font-black text-brand-500">
                  <Zap size={16} /> +{score}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">XP</span>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-zinc-900/50 px-4 py-2 border border-zinc-700">
                <span className="flex items-center gap-1 text-xl font-black text-zinc-100">
                  <Target size={16} className="text-brand-500" /> {matchedIds.size}/{TOTAL_PAIRS}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Pasangan</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-2xl border-b-4 border-brand-700 bg-brand-500 px-5 py-2.5 text-sm font-black text-zinc-900 hover:bg-brand-400 transition-all cursor-pointer"
          >
            <RotateCcw size={14} /> Main Lagi
          </button>
        </div>
      ) : (
        <>
          {!started && (
            <div className="mb-3 animate-pulse rounded-2xl border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-brand-400">
              👆 Klik kartu untuk memulai!
            </div>
          )}

          {/* Card grid — same 2-col layout as real game */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Left: Indonesian */}
            <div className="flex flex-col gap-2">
              {leftCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled={matchedIds.has(card.matchId)}
                  onClick={() => handleLeftClick(card.id)}
                  className={cardClass(
                    matchedIds.has(card.matchId),
                    wrongPair?.left === card.id,
                    successIds.has(card.id),
                    selectedLeft === card.id,
                  )}
                >
                  {card.text}
                </button>
              ))}
            </div>

            {/* Right: English */}
            <div className="flex flex-col gap-2">
              {rightCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled={matchedIds.has(card.matchId)}
                  onClick={() => handleRightClick(card.id)}
                  className={cardClass(
                    matchedIds.has(card.matchId),
                    wrongPair?.right === card.id,
                    successIds.has(card.id),
                    selectedRight === card.id,
                  )}
                >
                  {card.text}
                </button>
              ))}
            </div>
          </div>

          {/* Score footer */}
          <p className="mt-3 text-center text-xs font-semibold text-zinc-500 bg-zinc-900/40 py-1.5 rounded-xl border border-zinc-800/60">
            Cocok: <span className="font-black text-brand-500">{matchedIds.size}</span>/{TOTAL_PAIRS}
          </p>
        </>
      )}
    </div>
  )
}
