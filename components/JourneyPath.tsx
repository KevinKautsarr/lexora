'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Lock } from 'lucide-react'
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

/** Durasi animasi keluar kartu — unmount ditunda selama ini. */
const CARD_EXIT_MS = 150

// ---------------------------------------------------------------------------
// NodeCard — popover kartu saat node diklik. Muncul DI BAWAH node (mengikuti
// referensi), dengan animasi pop masuk & keluar. Menyatakan status singkat +
// satu aksi jelas (Mulai / Ulas) — "peek before commit".
// ---------------------------------------------------------------------------

function NodeCard({
  lesson,
  closing,
}: {
  lesson: LessonNode
  closing: boolean
}) {
  const isCompleted = lesson.status === 'completed'
  const isLocked = lesson.status === 'locked'
  const isPerfect = isCompleted && lesson.bestScore === MAX_LESSON_SCORE

  return (
    <div
      role="dialog"
      aria-label={lesson.title}
      className={`pointer-events-auto absolute left-1/2 top-[calc(100%+14px)] z-50 w-max min-w-[200px] max-w-[240px] rounded-2xl border border-zinc-700 bg-zinc-800 p-4 text-center shadow-2xl ${
        closing ? 'journey-card-out' : 'journey-card-in'
      }`}
    >
      <p className={`text-sm font-black ${isLocked ? 'text-zinc-400' : 'text-zinc-100'}`}>
        {lesson.title}
      </p>

      {isCompleted ? (
        <p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-brand-400">
          {isPerfect ? '★ Skor sempurna!' : '✓ Lesson ini sudah selesai'}
        </p>
      ) : isLocked ? (
        <p className="mt-1 text-xs text-zinc-500">
          Selesaikan lesson sebelumnya untuk membukanya
        </p>
      ) : (
        <p className="mt-1 text-xs text-zinc-400">Siap belajar kata-kata baru?</p>
      )}

      {isLocked ? (
        // Bukan tombol — status. Bentuknya menyerupai tombol Mulai agar model
        // kartunya konsisten, tapi jelas mati (abu-abu, tanpa interaksi).
        <div
          aria-disabled="true"
          className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border-b-4 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-sm font-black text-zinc-500 select-none"
        >
          <Lock size={14} aria-hidden />
          Terkunci
        </div>
      ) : (
        <Link
          href={`/game/${lesson.id}`}
          tabIndex={closing ? -1 : 0}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border-b-4 border-brand-700 bg-brand-500 px-4 py-2.5 text-sm font-black text-white transition-all hover:bg-brand-400 active:translate-y-0.5 active:border-b-2"
        >
          {isCompleted ? 'Ulas' : 'Mulai'}
          <ArrowRight size={15} aria-hidden />
        </Link>
      )}

      {/* Arrow penunjuk ke node (kartu di bawah → panah menghadap ke atas) */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-zinc-800" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// SingleNode
// ---------------------------------------------------------------------------

type CardState = 'open' | 'closing' | null

function SingleNode({
  lesson,
  offset,
  cardState,
  onToggle,
}: {
  lesson: LessonNode
  offset: number
  cardState: CardState
  onToggle: () => void
}) {
  // Semua node bisa diklik — node terkunci pun membuka kartu (berisi status
  // "Terkunci" + cara membukanya). Penting untuk mobile: tak ada hover di sana.
  const isLocked = lesson.status === 'locked'
  const isOpen = cardState === 'open'

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
  const nodeClasses = `relative block h-[72px] w-[72px] cursor-pointer select-none transition-transform duration-200 ${
    isLocked ? 'opacity-90 hover:scale-105' : 'hover:scale-110'
  } ${
    isActiveLessonNode
      ? 'drop-shadow-[0_0_12px_color-mix(in_oklch,var(--color-brand-500)_55%,transparent)]'
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

  return (
    <div
      id={isActiveLessonNode ? 'active-lesson' : undefined}
      data-lesson-id={isActiveLessonNode ? lesson.id : undefined}
      data-lesson-node={lesson.id}
      // transform (offset zigzag) menciptakan stacking context per-node, jadi
      // z-50 di kartu hanya berlaku LOKAL. Saat kartu terbuka, wrapper diangkat
      // di atas semua node lain; node aktif juga selalu diangkat (z-30) supaya
      // chip "MULAI"-nya tidak tertindih banner unit / node tetangga.
      className={`group relative flex justify-center scroll-mt-24 ${
        cardState !== null ? 'z-40' : isActiveLessonNode ? 'z-30' : 'z-0'
      }`}
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* Cincin pulsa "radar" di sekeliling node aktif — mengundang perhatian
          tanpa perlu teks tambahan. Berhenti otomatis untuk reduced-motion
          lewat blok global di globals.css. */}
      {isActiveLessonNode && (
        <span
          className="absolute inset-0 -z-10 animate-ping-slow rounded-full bg-brand-500/30"
          aria-hidden="true"
        />
      )}

      {/* Chip "MULAI" mengambang di atas node aktif — penanda persisten
          (kartu popover muncul di bawah, jadi keduanya tak pernah tabrakan). */}
      {isActiveLessonNode && (
        <span
          className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 rounded-full border-b-2 border-brand-700 bg-brand-500 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-md"
          aria-hidden="true"
        >
          Mulai
        </span>
      )}

      {/* Node aktif ("sedang ditempuh") memantul lembat naik-turun untuk
          mengundang klik. Bounce di wrapper (translateY) supaya tidak bentrok
          dengan hover:scale-110 di node (elemen berbeda). Wrapper terpisah dari
          div terluar yang memegang translateX offset zigzag. */}
      <div className={isActiveLessonNode ? 'animate-node-bounce' : undefined}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={isLocked ? `${lesson.title} (terkunci)` : lesson.title}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={nodeClasses}
        >
          {nodeImage}
        </button>
      </div>

      {/* Kartu popover saat node diklik — tetap dirender selama animasi
          keluar supaya pop-out terlihat. */}
      {cardState !== null && (
        <NodeCard lesson={lesson} closing={cardState === 'closing'} />
      )}
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
  // Kartu popover: satu terbuka sekaligus. closingId menahan kartu tetap
  // ter-render selama animasi keluar (pop-out) sebelum unmount.
  const [openLessonId, setOpenLessonId] = useState<string | null>(null)
  const [closingLessonId, setClosingLessonId] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function closeCard() {
    setOpenLessonId((cur) => {
      if (cur) setClosingLessonId(cur)
      return null
    })
  }

  function toggleCard(lessonId: string) {
    setOpenLessonId((cur) => {
      if (cur === lessonId) {
        setClosingLessonId(cur)
        return null
      }
      // Beralih dari node lain: kartu lama dianimasikan keluar.
      if (cur) setClosingLessonId(cur)
      return lessonId
    })
  }

  // Bersihkan closingId setelah animasi keluar selesai (unmount kartu lama).
  useEffect(() => {
    if (!closingLessonId) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setClosingLessonId(null), CARD_EXIT_MS)
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [closingLessonId])

  // Klik/tap DI MANA PUN selain node yang kartunya sedang terbuka → tutup.
  // Dicek per-node (data-lesson-node), bukan per-kontainer path — area kosong
  // di antara node juga dihitung "di luar". Esc juga menutup.
  useEffect(() => {
    if (!openLessonId) return
    function onPointerDown(e: PointerEvent) {
      const nodeEl = (e.target as Element | null)?.closest?.('[data-lesson-node]')
      if (!nodeEl || nodeEl.getAttribute('data-lesson-node') !== openLessonId) {
        closeCard()
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCard()
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [openLessonId])

  // Flatten to compute global index for zigzag
  let globalIndex = 0

  // pb kecil di bawah memberi ruang untuk bounce node terakhir (naik-turun 8px)
  // supaya tidak menabrak header level berikutnya.
  return (
    <div className="flex flex-col gap-12 pb-4">
      {units.map((unit) => {
        const unitStartIndex = globalIndex

        return (
          // overflow-x-CLIP, bukan -hidden: hidden memaksa sumbu Y ikut
          // ter-clip (jadi scroll container), memotong kartu popover node
          // terakhir yang menjorok ke bawah section. clip hanya memotong
          // horizontal (tujuan aslinya: cegah zigzag bikin scroll samping).
          <section key={unit.id} className="flex flex-col items-center gap-0 overflow-x-clip">
            <UnitBanner order={unit.order} title={unit.title} />

            {/* Node + connector column, centered. w-full + max-w so it never
                forces horizontal scroll on narrow phones; caps at 280px.
                pt-10 memberi ruang untuk chip "MULAI" di atas node pertama;
                pb memberi napas setelah node terakhir sebelum section berikutnya. */}
            <div
              className="flex w-full flex-col items-center pt-10 pb-4"
              style={{ maxWidth: CONTAINER_WIDTH }}
            >
              {unit.lessons.map((lesson, lessonIdx) => {
                const myOffset = getOffset(globalIndex)
                const nextOffset =
                  lessonIdx < unit.lessons.length - 1
                    ? getOffset(globalIndex + 1)
                    : null

                globalIndex++

                const cardState: CardState =
                  openLessonId === lesson.id
                    ? 'open'
                    : closingLessonId === lesson.id
                      ? 'closing'
                      : null

                return (
                  <div key={lesson.id} className="flex flex-col items-center w-full">
                    <SingleNode
                      lesson={lesson}
                      offset={myOffset}
                      cardState={cardState}
                      onToggle={() => toggleCard(lesson.id)}
                    />

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
