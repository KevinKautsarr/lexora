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
      className="w-max max-w-[180px] rounded-xl border border-brand-800 bg-brand-700 px-3 py-2 text-center shadow-xl"
      role="tooltip"
    >
      <p className="text-sm font-semibold text-brand-50">{title}</p>
      {bestScore !== null && status !== 'locked' && (
        <p className="mt-0.5 text-xs text-brand-200">Skor terbaik: {bestScore}</p>
      )}
      {status === 'locked' && (
        <p className="mt-0.5 text-xs text-brand-300">Selesaikan lesson sebelumnya</p>
      )}
      {/* Arrow */}
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-brand-700" />
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
        return `${base} border-brand-500 bg-brand-500 text-white hover:scale-110`
      case 'unlocked':
        return `${base} border-brand-500 bg-zinc-950 text-brand-600 ${
          lesson.isFrontmost ? 'shadow-[0_0_20px_4px_color-mix(in_oklch,var(--color-brand-500)_45%,transparent)]' : ''
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
              ? 'text-yellow-600'
              : lesson.status === 'unlocked'
                ? 'text-brand-600'
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

  // Node yang sedang dikerjakan diberi anchor supaya bisa di-scroll otomatis.
  const isActiveLesson = lesson.isFrontmost && lesson.status === 'unlocked'

  return (
    <div
      id={isActiveLesson ? 'active-lesson' : undefined}
      className="group relative flex justify-center scroll-mt-24"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* Pulse ring for frontmost unlocked lesson */}
      {isActiveLesson && (
        <span className="absolute inset-0 rounded-full animate-ping bg-brand-400/20" />
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
        stroke={completed ? 'var(--color-brand-500)' : 'var(--color-zinc-600)'}
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
    <div className="relative mb-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4 text-center shadow-sm">
      <div className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, #fff 0%, transparent 55%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 55%)',
        }}
      />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-100">
          Section {order}
        </p>
        <h2 className="mt-0.5 text-lg font-extrabold text-white">{title}</h2>
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
    <div className="flex flex-col gap-12">
      {units.map((unit) => {
        const unitStartIndex = globalIndex

        return (
          <section key={unit.id} className="flex flex-col items-center gap-0 overflow-x-hidden">
            <UnitBanner order={unit.order} title={unit.title} />

            {/* Node + connector column, centered. w-full + max-w so it never
                forces horizontal scroll on narrow phones; caps at 280px.
                pb memberi napas setelah node terakhir sebelum section berikutnya. */}
            <div
              className="flex w-full flex-col items-center pt-6 pb-4"
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
