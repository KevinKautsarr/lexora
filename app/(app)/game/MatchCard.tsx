'use client'

// Satu kartu di papan Match Madness. State visual dihitung parent (yang
// memegang seluruh state game); komponen ini murni pemetaan state → tampilan.

export type MatchCardState = 'idle' | 'selected' | 'wrong' | 'success' | 'matched'

const BASE =
  'flex min-h-[3.8rem] w-full items-center justify-center rounded-2xl border-2 border-b-4 px-4 py-3 text-base sm:text-lg lg:text-xl font-black transition-all duration-150 select-none shadow-sm text-center break-words'

const STATE_CLASS: Record<MatchCardState, string> = {
  matched: 'invisible pointer-events-none',
  success:
    'border-green-600 bg-green-500/10 text-green-700 border-b-2 translate-y-[2px] animate-success-pop',
  wrong:
    'border-red-500 bg-red-500/10 text-red-700 border-b-2 translate-y-[2px] animate-shake',
  selected: 'border-brand-500 bg-brand-500/10 text-brand-700 border-b-2 translate-y-[2px]',
  idle: 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:border-brand-500/60 hover:-translate-y-[2px] active:translate-y-[2px] active:border-b-2 cursor-pointer',
}

export default function MatchCard({
  label,
  state,
  onClick,
}: {
  /** Teks kartu; undefined = slot kosong (antrian habis). */
  label: string | undefined
  state: MatchCardState
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={label === undefined}
      onClick={onClick}
      className={`${BASE} ${STATE_CLASS[state]}`}
    >
      {label}
    </button>
  )
}
