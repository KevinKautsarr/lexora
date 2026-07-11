'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MAX_LESSON_SCORE } from '@/app/(app)/game/scoring'

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

  // Pilih badge PNG sesuai status lesson. Prioritas: lesson terakhir unit &
  // sudah selesai → trophy; selesai dengan skor sempurna → perfect (bintang);
  // selesai biasa → completed (check); terbuka → active (play); terkunci → locked.
  const isPerfect = lesson.status === 'completed' && lesson.bestScore === MAX_LESSON_SCORE
  const badge = (() => {
    if (lesson.isLastInUnit && lesson.status === 'completed') return '/node-trophy.png'
    if (isPerfect) return '/node-perfect.png'
    switch (lesson.status) {
      case 'completed':
        return '/node-completed.png'
      case 'unlocked':
        return '/node-active.png'
      case 'locked':
      default:
        return '/node-locked.png'
    }
  })()

  // Badge lesson-terakhir yang belum selesai tetap pakai state normalnya
  // (active/locked) supaya user tahu ini masih bisa/tak bisa dimainkan; trophy
  // hanya muncul setelah unit tuntas — memberi rasa "hadiah".

  const isActiveLessonNode = lesson.isFrontmost && lesson.status === 'unlocked'
  const nodeClasses = `relative block h-[72px] w-[72px] select-none transition-transform duration-200 ${
    isClickable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
  } ${
    isActiveLessonNode
      ? 'drop-shadow-[0_0_12px_color-mix(in_oklch,var(--color-brand-500)_55%,transparent)]'
      : lesson.status === 'locked'
        ? 'opacity-90'
        : ''
  }`

  const nodeImage = (
    <Image
      src={badge}
      alt=""
      width={72}
      height={72}
      className="h-full w-full object-contain drop-shadow-sm"
      priority={isActiveLessonNode}
    />
  )

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
      id={isActiveLessonNode ? 'active-lesson' : undefined}
      data-lesson-id={isActiveLessonNode ? lesson.id : undefined}
      className="group relative flex justify-center scroll-mt-24"
      style={{ transform: `translateX(${offset}px)` }}
    >

      {/* Node aktif ("sedang ditempuh") memantul lembat naik-turun untuk
          mengundang klik. Bounce di wrapper (translateY) supaya tidak bentrok
          dengan hover:scale-110 di node (elemen berbeda). Wrapper terpisah dari
          div terluar yang memegang translateX offset zigzag. */}
      <div className={isActiveLessonNode ? 'animate-node-bounce' : undefined}>
        {isClickable ? (
          <Link href={`/game/${lesson.id}`} aria-label={lesson.title} className={nodeClasses}>
            {nodeImage}
          </Link>
        ) : (
          <div aria-disabled aria-label={lesson.title} className={nodeClasses}>
            {nodeImage}
          </div>
        )}
      </div>

      {tooltip}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConnectorLine — SVG diagonal between two nodes
// ---------------------------------------------------------------------------

const CONTAINER_WIDTH = 280 // px — same as the w-[280px] container
const CONNECTOR_HEIGHT = 40 // px — vertical gap between nodes

// Spacer vertikal antar node. Garis penghubung sengaja dihilangkan (gaya map
// game seperti referensi) — hanya menyisakan jarak agar node tetap berspasi.
function ConnectorLine() {
  return <div className="w-full flex-shrink-0" style={{ height: CONNECTOR_HEIGHT }} aria-hidden />
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

  // pb kecil di bawah memberi ruang untuk bounce node terakhir (naik-turun 8px)
  // supaya tidak menabrak header level berikutnya.
  return (
    <div className="flex flex-col gap-12 pb-4">
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

                globalIndex++

                return (
                  <div key={lesson.id} className="flex flex-col items-center w-full">
                    <SingleNode lesson={lesson} offset={myOffset} />

                    {/* Spacer antar node (garis penghubung dihilangkan) */}
                    {nextOffset !== null && <ConnectorLine />}
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
