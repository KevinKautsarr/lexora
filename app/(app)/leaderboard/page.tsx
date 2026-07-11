import { Crown, Medal, Trophy, ArrowUp, ArrowDown, Timer, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import Link from 'next/link'
import { levelForXp } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import EmptyState from '@/components/EmptyState'
import LeagueBadge from '@/components/LeagueBadge'
import { checkAndResetWeeklyLeagueGlobal, getWeekStart } from '@/lib/league'

const TOP_LIMIT = 20

// ── Division config — konsisten dengan tema sage LEXORA ────────────
// Perunggu = amber lembut (medali perunggu), Perak = netral sand (zinc),
// Emas = token xp (#E0B04A, sudah jadi sistem warna kita). Promosi = brand
// (hijau), Degradasi = red. Semua diambil dari token, bukan warna mentah acak.
const DIVISION_META = {
  BRONZE: {
    name: 'Perunggu',
    headerBg: 'bg-gradient-to-br from-brand-100 to-brand-50',
    headerBorder: 'border-amber-300/50',
    activeTab: 'bg-amber-100 text-amber-800 border-amber-400/50 shadow-sm',
    inactiveTab: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border-transparent',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300/50',
    tagline: 'Tempatkan dirimu di Top 3 untuk promosi ke Divisi Perak!',
    accentColor: 'text-amber-700',
    icon: <Trophy size={14} className="text-amber-700" aria-hidden />,
  },
  SILVER: {
    name: 'Perak',
    headerBg: 'bg-gradient-to-br from-brand-100 to-brand-50',
    headerBorder: 'border-zinc-600/50',
    activeTab: 'bg-zinc-700 text-zinc-100 border-zinc-500/50 shadow-sm',
    inactiveTab: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border-transparent',
    badge: 'bg-zinc-700 text-zinc-100 border border-zinc-500/50',
    tagline: 'Top 3 naik ke Emas! Bottom 3 atau tidak aktif turun ke Perunggu.',
    accentColor: 'text-zinc-300',
    icon: <Medal size={14} className="text-zinc-400" aria-hidden />,
  },
  GOLD: {
    name: 'Emas',
    headerBg: 'bg-gradient-to-br from-xp-100 to-brand-50',
    headerBorder: 'border-xp-400/50',
    activeTab: 'bg-xp-100 text-xp-800 border-xp-400/50 shadow-sm',
    inactiveTab: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border-transparent',
    badge: 'bg-xp-100 text-xp-800 border border-xp-400/50',
    tagline: 'Liga tertinggi! Pertahankan Top 3 untuk meraih lencana Juara!',
    accentColor: 'text-xp-700',
    icon: <Crown size={14} className="text-xp-600" aria-hidden />,
  },
} as const

type Division = keyof typeof DIVISION_META

// ── Rank badge ───────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-xp-100 text-xp-800">
        <Crown size={14} aria-label="Peringkat 1" />
      </span>
    )
  if (rank === 2)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-zinc-100">
        <Medal size={14} aria-label="Peringkat 2" />
      </span>
    )
  if (rank === 3)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Medal size={14} aria-label="Peringkat 3" />
      </span>
    )
  return (
    <span className="flex h-7 w-7 items-center justify-center text-sm font-black text-zinc-400 tabular-nums">
      {rank}
    </span>
  )
}

// ── Podium card for Top 3 ─────────────────────────────────────────
function PodiumCard({
  rank,
  name,
  xp,
  xpThisWeek,
  isMe,
}: {
  rank: 1 | 2 | 3
  name: string
  xp: number
  xpThisWeek: number
  isMe: boolean
}) {
  // Rank 1 = emas (token xp), Rank 2 = perak (sand terang: zinc-800/700),
  // Rank 3 = perunggu (amber lembut). Warna podium TETAP mengikuti rank,
  // walau itu kartu "kamu" — status juara tidak boleh tertimpa. Penanda
  // "kamu" cukup lewat ring luar + label, bukan ganti warna avatar.
  const configs = {
    1: {
      height: 'h-24',
      borderColor: 'border-xp-400/60',
      bgColor: 'bg-gradient-to-b from-xp-100 to-xp-50',
      avatarBg: 'bg-xp-200 border-xp-400 text-xp-700',
      numBg: 'bg-xp-500 text-white',
      order: 'order-2',
      icon: <Crown size={16} className="text-xp-600 animate-pulse" aria-hidden />,
    },
    2: {
      height: 'h-16',
      borderColor: 'border-zinc-600/60',
      bgColor: 'bg-gradient-to-b from-zinc-800 to-zinc-900',
      avatarBg: 'bg-zinc-700 border-zinc-600 text-zinc-100',
      numBg: 'bg-zinc-500 text-white',
      order: 'order-1',
      icon: null,
    },
    3: {
      height: 'h-12',
      borderColor: 'border-amber-300/50',
      bgColor: 'bg-gradient-to-b from-amber-100 to-amber-50',
      avatarBg: 'bg-amber-100 border-amber-300 text-amber-700',
      numBg: 'bg-amber-600 text-white',
      order: 'order-3',
      icon: null,
    },
  }
  const c = configs[rank]

  return (
    <div className={`flex flex-col items-center gap-1.5 ${c.order}`}>
      {c.icon}
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-sm font-black ${c.avatarBg} ${
          isMe ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-zinc-900' : ''
        }`}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
      <p className={`max-w-[76px] truncate text-center text-[11px] font-black leading-tight ${isMe ? 'text-brand-600' : 'text-zinc-700'}`}>
        {name}
        {isMe && <span className="block text-[9px] font-bold text-brand-500">(kamu)</span>}
      </p>
      <p className="flex items-center gap-0.5 text-[10px] font-bold tabular-nums text-brand-600">
        <Zap size={9} aria-hidden />
        {xpThisWeek.toLocaleString('id-ID')}
      </p>
      {/* Pedestal bar */}
      <div className={`${c.height} w-full rounded-t-xl border border-b-0 ${c.borderColor} ${c.bgColor} flex items-start justify-center pt-2`}>
        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${c.numBg}`}>
          {rank}
        </span>
      </div>
    </div>
  )
}

// ── List row ──────────────────────────────────────────────────────
function Row({
  rank,
  name,
  xp,
  xpThisWeek,
  isMe,
  totalCount,
  selectedDivision,
}: {
  rank: number
  name: string
  xp: number
  xpThisWeek: number
  isMe: boolean
  totalCount: number
  selectedDivision: Division
}) {
  const meta = DIVISION_META[selectedDivision]
  const isPromotionZone = rank <= 3 && xpThisWeek > 0
  const isDemotionZone =
    selectedDivision !== 'BRONZE' &&
    (xpThisWeek === 0 || (rank >= 4 && rank > totalCount - 3))

  // Zebra-stripe pada baris netral (bukan zona kamu/promosi/degradasi) agar
  // daftar panjang lebih mudah di-scan mata saat scroll.
  let rowClass = rank % 2 === 0
    ? 'border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800/60'
    : 'border-zinc-700 bg-zinc-800/20 hover:bg-zinc-800/60'
  let zoneBadge = null

  if (isMe) {
    rowClass = 'border-brand-500/60 bg-brand-100/60 shadow-sm'
  } else if (isPromotionZone) {
    // Juara (Emas) = emas/xp; Promosi (divisi lain) = hijau brand.
    rowClass = selectedDivision === 'GOLD'
      ? 'border-xp-400/50 bg-xp-100/60 hover:bg-xp-100'
      : 'border-brand-400/50 bg-brand-100/60 hover:bg-brand-100'
    zoneBadge = selectedDivision === 'GOLD' ? (
      <span className="flex items-center gap-0.5 rounded-full bg-xp-100 px-2 py-0.5 text-[9px] font-black uppercase text-xp-800 border border-xp-300">
        <Crown size={8} aria-hidden /> Juara
      </span>
    ) : (
      <span className="flex items-center gap-0.5 rounded-full bg-brand-100 px-2 py-0.5 text-[9px] font-black uppercase text-brand-700 border border-brand-300">
        <ArrowUp size={8} aria-hidden /> Promosi
      </span>
    )
  } else if (isDemotionZone) {
    rowClass = 'border-red-300/50 bg-red-100/60 hover:bg-red-100'
    zoneBadge = (
      <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase text-red-700 border border-red-300">
        <ArrowDown size={8} aria-hidden /> Degradasi
      </span>
    )
  }

  return (
    <li className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-150 ${rowClass}`}>
      <RankBadge rank={rank} />

      <span className="min-w-0 flex-1 truncate">
        <span className={`block text-sm font-bold leading-tight ${isMe ? 'text-brand-700' : 'text-zinc-100'}`}>
          {name}
          {isMe && <span className="ml-1.5 text-[10px] font-black uppercase text-brand-500">(kamu)</span>}
        </span>
        <span className="flex items-center gap-1 mt-0.5 flex-wrap">
          <span className="rounded bg-zinc-900/60 border border-zinc-800 px-1.5 py-px text-[9px] font-black text-zinc-400">
            Lv {levelForXp(xp)}
          </span>
          {zoneBadge}
        </span>
      </span>

      <span className="shrink-0 flex items-center gap-1 text-sm font-black tabular-nums text-brand-600">
        <Zap size={12} className="text-brand-500" aria-hidden />
        {xpThisWeek.toLocaleString('id-ID')}
      </span>
    </li>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ division?: string }>
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  // Reset liga dijalankan non-blocking setelah respons (tidak menahan render).
  // Trade-off: pada request pertama tiap minggu, papan peringkat bisa tampil
  // dengan data minggu sebelumnya sesaat; refresh berikutnya sudah ter-reset.
  after(async () => {
    await checkAndResetWeeklyLeagueGlobal()
  })

  const sp = await searchParams
  const me = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { id: true, name: true, xp: true, xpThisWeek: true, division: true, createdAt: true },
  })

  const selectedDivision = (
    sp.division?.toUpperCase() || me.division || 'BRONZE'
  ) as Division

  const [topUsers, myRankCount] = await Promise.all([
    prisma.user.findMany({
      where: { division: selectedDivision },
      orderBy: [{ xpThisWeek: 'desc' }, { createdAt: 'asc' }],
      take: TOP_LIMIT,
      select: { id: true, name: true, xp: true, xpThisWeek: true },
    }),
    prisma.user.count({
      where: {
        division: selectedDivision,
        OR: [
          { xpThisWeek: { gt: me.xpThisWeek } },
          { xpThisWeek: me.xpThisWeek, createdAt: { lt: me.createdAt } },
        ],
      },
    }),
  ])

  const inTop = topUsers.some((u) => u.id === me.id)
  const myRank = myRankCount + 1

  const now = new Date()
  const currentWeekStart = getWeekStart(now)
  const nextWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  const diffMs = nextWeekStart.getTime() - now.getTime()
  const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)))
  const diffHours = Math.max(0, Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)))

  const meta = DIVISION_META[selectedDivision]
  const topThree = topUsers.slice(0, 3)
  const restUsers = topUsers.slice(3)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-3xl border ${meta.headerBorder} ${meta.headerBg} p-5 shadow-sm`}>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {/* Division badge + rank chip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${meta.badge}`}>
                {meta.icon}
                Divisi {meta.name}
              </span>
              {me.division === selectedDivision && (
                <span className="rounded-full bg-brand-100 border border-brand-300/60 px-2.5 py-1 text-[10px] font-black text-brand-700">
                  Peringkatmu #{myRank}
                </span>
              )}
            </div>

            <h1 className="font-display text-xl font-extrabold leading-tight text-zinc-100 tracking-tight md:text-2xl">
              Liga Mingguan Lexora
            </h1>
            <p className="text-xs leading-relaxed text-zinc-400 max-w-[240px]">
              {meta.tagline}
            </p>

            {/* Countdown */}
            <div className="mt-1 flex w-max items-center gap-2 rounded-xl bg-zinc-900/50 border border-zinc-700 px-3 py-1.5">
              <Timer size={12} className="text-brand-500 shrink-0" aria-hidden />
              <span className="text-[10px] font-black text-zinc-300 tabular-nums">
                Berakhir dalam&nbsp;
                <span className="text-brand-400">{diffDays}h {diffHours}j</span>
              </span>
            </div>
          </div>

          {/* Division badge — elemen LCP di halaman ini, load eager. */}
          <div className="shrink-0 select-none drop-shadow-lg">
            <LeagueBadge division={selectedDivision} size={80} priority />
          </div>
        </div>
      </div>

      {/* ── Division Tabs ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800">
        {(Object.keys(DIVISION_META) as Division[]).map((div) => {
          const isActive = selectedDivision === div
          const isUserDiv = me.division === div
          const m = DIVISION_META[div]
          return (
            <Link
              key={div}
              href={`/leaderboard?division=${div.toLowerCase()}`}
              className={`relative flex flex-col items-center gap-1 rounded-xl py-2.5 border text-center transition-all duration-150 cursor-pointer ${isActive ? m.activeTab : m.inactiveTab}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="flex items-center gap-1">
                {m.icon}
                <span className="text-xs font-black tracking-tight">{m.name}</span>
              </span>
              {isUserDiv && (
                <span className="absolute -top-1.5 -right-0.5 flex items-center rounded-full bg-brand-500 px-1.5 py-px text-[7px] font-black text-white uppercase border border-zinc-900 shadow-sm">
                  Divisimu
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {topUsers.length === 0 ? (
        <EmptyState
          title="Papan peringkat masih kosong"
          description="Selesaikan lesson pertama kamu minggu ini untuk menempati posisi teratas!"
          image={{ src: '/assets/treasure-map.png', ratio: 1, width: 128 }}
        />
      ) : (
        <>
          {/* ── Podium Top 3 ──────────────────────────────────────── */}
          {topThree.length >= 1 && (
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/50 px-4 pb-2 pt-4">
              <p className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Posisi Teratas Minggu Ini
              </p>
              <div className="grid grid-cols-3 items-end gap-2">
                {([2, 1, 3] as const).map((podiumRank) => {
                  const user = topThree[podiumRank - 1]
                  if (!user) {
                    return (
                      <div key={podiumRank} className={`flex flex-col items-center gap-2 ${podiumRank === 1 ? 'order-2' : podiumRank === 2 ? 'order-1' : 'order-3'}`}>
                        <div className="h-10 w-10 rounded-2xl border border-zinc-700 bg-zinc-800/50" />
                        <div className={`${podiumRank === 1 ? 'h-24' : podiumRank === 2 ? 'h-16' : 'h-12'} w-full rounded-t-xl border border-b-0 border-zinc-800 bg-zinc-900/30`} />
                      </div>
                    )
                  }
                  return (
                    <PodiumCard
                      key={user.id}
                      rank={podiumRank}
                      name={user.name ?? 'Pelajar'}
                      xp={user.xp}
                      xpThisWeek={user.xpThisWeek}
                      isMe={user.id === me.id}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* ── List rank 4+ ──────────────────────────────────────── */}
          {restUsers.length > 0 && (
            <ol className="flex flex-col gap-2" aria-label="Peringkat 4 ke bawah">
              {restUsers.map((user, index) => (
                <Row
                  key={user.id}
                  rank={index + 4}
                  name={user.name ?? 'Pelajar'}
                  xp={user.xp}
                  xpThisWeek={user.xpThisWeek}
                  isMe={user.id === me.id}
                  totalCount={topUsers.length}
                  selectedDivision={selectedDivision}
                />
              ))}
            </ol>
          )}
        </>
      )}

      {/* ── User's out-of-top row ───────────────────────────────── */}
      {!inTop && me.division === selectedDivision && (
        <>
          <p className="text-center text-xs font-bold tracking-widest text-zinc-500" aria-hidden>• • •</p>
          <ol aria-label="Posisiku di luar top 20">
            <Row
              rank={myRank}
              name={me.name ?? 'Pelajar'}
              xp={me.xp}
              xpThisWeek={me.xpThisWeek}
              isMe
              totalCount={topUsers.length + 1}
              selectedDivision={selectedDivision}
            />
          </ol>
        </>
      )}
    </div>
  )
}
