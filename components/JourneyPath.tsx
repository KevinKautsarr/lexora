'use client'

import Link from 'next/link'
import { Check, Lock, Play, Trophy } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LessonNode = {
  id: string
  title: string
  order: number
  /** 'completed' | 'unlocked' | 'locked' */
  status: 'completed' | 'unlocked' | 'locked'
  /** Score terbaik user untuk lesson ini (jika ada). */
  bestScore: number | null
  /** Apakah ini node unlocked yang paling pertama (belum completed). */
  isFrontmost: boolean
  /** Apakah ini lesson terakhir dalam unit-nya. */
  isLastInUnit: boolean
}

export type UnitSection = {
  id: string
  title: string
  order: number
  lessons: LessonNode[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// 3-cycle zigzag: center → right → left → center → ...
const ZIGZAG_OFFSETS = [0, 60, -60] as const

function getOffset(globalIndex: number): number {
  return ZIGZAG_OFFSETS[globalIndex % ZIGZAG_OFFSETS.length]
}

// ---------------------------------------------------------------------------
// NodeTooltip — rendered on hover
// ---------------------------------------------------------------------------

function NodeTooltip({
  title,
  bestScore,
  status,
}: {
  title: string
  bestScore: number | null
  status: LessonNode['status']
}) {
  return (
    <div
      className="w-max max-w-[180px] rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-center shadow-xl"
      role="tooltip"
    >
      <p className="text-sm font-semibold text-zinc-100">{title}</p>
      {bestScore !== null && status !== 'locked' && (
        <p className="mt-0.5 text-xs text-emerald-400">Skor terbaik: {bestScore}</p>
      )}
      {status === 'locked' && (
        <p className="mt-0.5 text-xs text-zinc-500">Selesaikan lesson sebelumnya</p>
      )}
      {/* Arrow */}
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// SingleNode
// ---------------------------------------------------------------------------

function SingleNode({
  lesson,
  offset,
}: {
  lesson: LessonNode
  offset: number
}) {
  const isClickable = lesson.status !== 'locked'

  const nodeClasses = (() => {
    const base =
      'relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 transition-transform duration-200 select-none cursor-default'

    switch (lesson.status) {
      case 'completed':
        return `${base} border-emerald-500 bg-emerald-500 text-white hover:scale-110`
      case 'unlocked':
        return `${base} border-emerald-400 bg-zinc-950 text-emerald-400 ${
          lesson.isFrontmost ? 'shadow-[0_0_20px_4px_rgba(52,211,153,0.35)]' : ''
        } hover:scale-110 cursor-pointer`
      case 'locked':
      default:
        return `${base} border-zinc-700 bg-zinc-800/60 text-zinc-600`
    }
  })()

  const icon = (() => {
    if (lesson.isLastInUnit) {
      return (
        <Trophy
          size={28}
          strokeWidth={2}
          className={
            lesson.status === 'completed'
              ? 'text-yellow-300'
              : lesson.status === 'unlocked'
                ? 'text-emerald-400'
                : 'text-zinc-600'
          }
        />
      )
    }
    switch (lesson.status) {
      case 'completed':
        return <Check size={30} strokeWidth={2.5} />
      case 'unlocked':
        return <Play size={26} strokeWidth={2} className="translate-x-0.5" />
      case 'locked':
        return <Lock size={24} strokeWidth={2} />
    }
  })()

  // Tooltip shows on hover AND keyboard focus (group-hover/group-focus-within),
  // so keyboard and touch users get the title, best score & locked reason too.
  const tooltip = (
    <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-50 hidden -translate-x-1/2 group-hover:block group-focus-within:block">
      <NodeTooltip
        title={lesson.title}
        bestScore={lesson.bestScore}
        status={lesson.status}
      />
    </div>
  )

  return (
    <div
      className="group relative flex justify-center"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* Pulse ring for frontmost unlocked lesson */}
      {lesson.isFrontmost && lesson.status === 'unlocked' && (
        <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20" />
      )}

      {isClickable ? (
        <Link href={`/game/${lesson.id}`} aria-label={lesson.title} className={nodeClasses}>
          {icon}
        </Link>
      ) : (
        <div aria-disabled aria-label={lesson.title} className={nodeClasses}>
          {icon}
        </div>
      )}

      {tooltip}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConnectorLine — SVG diagonal between two nodes
// ---------------------------------------------------------------------------

const CONTAINER_WIDTH = 280 // px — same as the w-[280px] container
const CONNECTOR_HEIGHT = 40 // px — vertical gap between nodes

function ConnectorLine({
  fromOffset,
  toOffset,
  completed,
}: {
  fromOffset: number
  toOffset: number
  completed: boolean
}) {
  const cx = CONTAINER_WIDTH / 2
  const x1 = cx + fromOffset
  const y1 = 0
  const x2 = cx + toOffset
  const y2 = CONNECTOR_HEIGHT

  return (
    <svg
      width="100%"
      height={CONNECTOR_HEIGHT}
      viewBox={`0 0 ${CONTAINER_WIDTH} ${CONNECTOR_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full flex-shrink-0"
      aria-hidden
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={completed ? '#10b981' : '#3f3f46'}
        strokeWidth={3}
        strokeDasharray={completed ? '0' : '6 4'}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// UnitBanner
// ---------------------------------------------------------------------------

function UnitBanner({ order, title }: { order: number; title: string }) {
  return (
    <div className="relative mb-2 flex w-full items-center justify-center overflow-hidden rounded-2xl border border-emerald-800/60 bg-gradient-to-r from-emerald-950/80 via-zinc-900/90 to-emerald-950/80 px-6 py-4 text-center">
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 60%), radial-gradient(circle at 80% 50%, #059669 0%, transparent 60%)',
        }}
      />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">
          Section {order}
        </p>
        <h2 className="mt-0.5 text-lg font-extrabold text-zinc-100">{title}</h2>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// JourneyPath — exported main component
// ---------------------------------------------------------------------------

export default function JourneyPath({ units }: { units: UnitSection[] }) {
  // Flatten to compute global index for zigzag
  let globalIndex = 0

  return (
    <div className="flex flex-col gap-10">
      {units.map((unit) => {
        const unitStartIndex = globalIndex

        return (
          <section key={unit.id} className="flex flex-col items-center gap-0 overflow-x-hidden">
            <UnitBanner order={unit.order} title={unit.title} />

            {/* Node + connector column, centered. w-full + max-w so it never
                forces horizontal scroll on narrow phones; caps at 280px. */}
            <div
              className="flex w-full flex-col items-center pt-6"
              style={{ maxWidth: CONTAINER_WIDTH }}
            >
              {unit.lessons.map((lesson, lessonIdx) => {
                const myOffset = getOffset(globalIndex)
                const nextOffset =
                  lessonIdx < unit.lessons.length - 1
                    ? getOffset(globalIndex + 1)
                    : null
                const isCompleted = lesson.status === 'completed'

                globalIndex++

                return (
                  <div key={lesson.id} className="flex flex-col items-center w-full">
                    <SingleNode lesson={lesson} offset={myOffset} />

                    {/* Connector to next node (not after last lesson in unit) */}
                    {nextOffset !== null && (
                      <ConnectorLine
                        fromOffset={myOffset}
                        toOffset={nextOffset}
                        completed={isCompleted}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )

        // suppress unused variable warning — globalIndex is mutated in closure
        void unitStartIndex
      })}
    </div>
  )
}
