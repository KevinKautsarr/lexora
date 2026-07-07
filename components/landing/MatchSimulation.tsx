'use client'

import { useState, useEffect } from 'react'
import { Check, RotateCcw, Sparkles } from 'lucide-react'

interface Card {
  id: string
  text: string
  type: 'en' | 'id'
  matchId: string
}

const INITIAL_CARDS: Card[] = [
  // English words
  { id: 'en-1', text: 'Run', type: 'en', matchId: '1' },
  { id: 'en-2', text: 'Book', type: 'en', matchId: '2' },
  { id: 'en-3', text: 'Happy', type: 'en', matchId: '3' },
  { id: 'en-4', text: 'School', type: 'en', matchId: '4' },
  // Indonesian translations (shuffled manually)
  { id: 'id-3', text: 'Senang', type: 'id', matchId: '3' },
  { id: 'id-1', text: 'Berlari', type: 'id', matchId: '1' },
  { id: 'id-4', text: 'Sekolah', type: 'id', matchId: '4' },
  { id: 'id-2', text: 'Buku', type: 'id', matchId: '2' },
]

export default function MatchSimulation() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS)
  const [selectedEn, setSelectedEn] = useState<Card | null>(null)
  const [selectedId, setSelectedId] = useState<Card | null>(null)
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())
  const [wrongPairs, setWrongPairs] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)

  const handleCardClick = (card: Card) => {
    if (matchedIds.has(card.matchId)) return
    if (wrongPairs.size > 0) return // block clicks during wrong animation

    if (card.type === 'en') {
      if (selectedEn?.id === card.id) {
        setSelectedEn(null) // deselect
      } else {
        setSelectedEn(card)
      }
    } else {
      if (selectedId?.id === card.id) {
        setSelectedId(null) // deselect
      } else {
        setSelectedId(card)
      }
    }
  }

  // Check for match
  useEffect(() => {
    if (selectedEn && selectedId) {
      if (selectedEn.matchId === selectedId.matchId) {
        // MATCH
        const matchId = selectedEn.matchId
        setMatchedIds((prev) => {
          const next = new Set(prev)
          next.add(matchId)
          return next
        })
        setScore((s) => s + 20)
        setSelectedEn(null)
        setSelectedId(null)
      } else {
        // MISMATCH
        const currentEnId = selectedEn.id
        const currentIdId = selectedId.id
        setWrongPairs(new Set([currentEnId, currentIdId]))

        // Reset after animation
        const timer = setTimeout(() => {
          setWrongPairs(new Set())
          setSelectedEn(null)
          setSelectedId(null)
        }, 800)

        return () => clearTimeout(timer)
      }
    }
  }, [selectedEn, selectedId])

  const handleReset = () => {
    setMatchedIds(new Set())
    setSelectedEn(null)
    setSelectedId(null)
    setWrongPairs(new Set())
    setScore(0)
  }

  const isCompleted = matchedIds.size === INITIAL_CARDS.length / 2

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-700/60 bg-zinc-800/80 p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-zinc-700/50 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-xp-400" size={18} />
          <span className="text-sm font-black text-zinc-200 uppercase tracking-wider">
            Match Madness Sim
          </span>
        </div>
        <div className="rounded-lg bg-zinc-900/60 px-3 py-1 font-mono text-xs font-bold text-xp-400">
          Skor: {score} XP
        </div>
      </div>

      {isCompleted ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/20 text-brand-500 animate-pulse">
            <Check size={32} strokeWidth={3} />
          </div>
          <h4 className="text-base font-black text-zinc-100 mb-1">
            Luar Biasa! Cocok Semua!
          </h4>
          <p className="text-xs text-zinc-400 max-w-[240px] mb-4">
            Kamu baru saja melatih ingatan kosakata dengan cara mencocokkan kata.
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-500 active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} />
            Main Lagi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Indonesian Column */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1">
              Bahasa Indonesia
            </span>
            {cards
              .filter((c) => c.type === 'id')
              .map((card) => {
                const isSelected = selectedId?.id === card.id
                const isMatched = matchedIds.has(card.matchId)
                const isWrong = wrongPairs.has(card.id)

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    disabled={isMatched}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200 cursor-pointer text-left
                      ${
                        isMatched
                          ? 'border-transparent bg-brand-500/10 text-brand-600 opacity-60 cursor-default'
                          : isWrong
                            ? 'border-red-500 bg-red-500/10 text-red-500 animate-shake'
                            : isSelected
                              ? 'border-brand-500 bg-zinc-950 text-brand-500 scale-[1.02] shadow-md shadow-brand-500/5'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-750'
                      }
                    `}
                  >
                    <span>{card.text}</span>
                    {isMatched && <Check size={14} strokeWidth={3} />}
                  </button>
                )
              })}
          </div>

          {/* English Column */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-1">
              Bahasa Inggris
            </span>
            {cards
              .filter((c) => c.type === 'en')
              .map((card) => {
                const isSelected = selectedEn?.id === card.id
                const isMatched = matchedIds.has(card.matchId)
                const isWrong = wrongPairs.has(card.id)

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    disabled={isMatched}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200 cursor-pointer text-left
                      ${
                        isMatched
                          ? 'border-transparent bg-brand-500/10 text-brand-600 opacity-60 cursor-default'
                          : isWrong
                            ? 'border-red-500 bg-red-500/10 text-red-500 animate-shake'
                            : isSelected
                              ? 'border-brand-500 bg-zinc-950 text-brand-500 scale-[1.02] shadow-md shadow-brand-500/5'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-750'
                      }
                    `}
                  >
                    <span>{card.text}</span>
                    {isMatched && <Check size={14} strokeWidth={3} />}
                  </button>
                )
              })}
          </div>
        </div>
      )}

      {/* Styled animation helper */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
