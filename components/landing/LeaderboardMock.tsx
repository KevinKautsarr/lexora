import { Crown, Medal, Trophy, ArrowUp, Zap } from 'lucide-react'

// ─── Mock data ───────────────────────────────────────────────────────
const MOCK_USERS = [
  { rank: 1, name: 'Kevin',  xp: 12450, xpWeek: 2450 },
  { rank: 2, name: 'Budi',   xp: 9820,  xpWeek: 2120 },
  { rank: 3, name: 'Siti',   xp: 8760,  xpWeek: 1980 },
  { rank: 4, name: 'Rian',   xp: 6540,  xpWeek: 1750 },
  { rank: 5, name: 'Amel',   xp: 5210,  xpWeek: 1540 },
]

const TABS = [
  { label: 'Perunggu', icon: <Trophy size={12} className="text-amber-700" />, active: false },
  { label: 'Perak',    icon: <Medal   size={12} className="text-zinc-400"  />, active: false },
  { label: 'Emas',     icon: <Crown   size={12} className="text-xp-600"    />, active: true  },
]

// ─── Sub-components ──────────────────────────────────────────────────
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

type PodiumRank = 1 | 2 | 3

const PODIUM_CFG: Record<PodiumRank, {
  height: string; borderColor: string; bgColor: string
  avatarBg: string; numBg: string; order: string
  icon: React.ReactNode
}> = {
  1: {
    height: 'h-20', borderColor: 'border-xp-400/60',
    bgColor: 'bg-gradient-to-b from-xp-100 to-xp-50',
    avatarBg: 'bg-xp-200 border-xp-400 text-xp-700',
    numBg: 'bg-xp-500 text-white', order: 'order-2',
    icon: <Crown size={14} className="text-xp-600 animate-pulse" />,
  },
  2: {
    height: 'h-14', borderColor: 'border-zinc-600/60',
    bgColor: 'bg-gradient-to-b from-zinc-800 to-zinc-900',
    avatarBg: 'bg-zinc-700 border-zinc-600 text-zinc-100',
    numBg: 'bg-zinc-500 text-white', order: 'order-1',
    icon: null,
  },
  3: {
    height: 'h-10', borderColor: 'border-amber-300/50',
    bgColor: 'bg-gradient-to-b from-amber-100 to-amber-50',
    avatarBg: 'bg-amber-100 border-amber-300 text-amber-700',
    numBg: 'bg-amber-600 text-white', order: 'order-3',
    icon: null,
  },
}

function PodiumCard({ rank, name, xpWeek }: { rank: PodiumRank; name: string; xpWeek: number }) {
  const c = PODIUM_CFG[rank]
  return (
    <div className={`flex flex-col items-center gap-1 ${c.order}`}>
      {c.icon}
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 text-sm font-black ${c.avatarBg}`}>
        {name.slice(0, 2).toUpperCase()}
      </div>
      <p className="max-w-[70px] truncate text-center text-[11px] font-black text-zinc-700 leading-tight">
        {name}
      </p>
      <p className="flex items-center gap-0.5 text-[10px] font-bold tabular-nums text-brand-600">
        <Zap size={9} /> {xpWeek.toLocaleString('id-ID')}
      </p>
      <div className={`${c.height} w-full rounded-t-xl border border-b-0 ${c.borderColor} ${c.bgColor} flex items-start justify-center pt-1.5`}>
        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${c.numBg}`}>
          {rank}
        </span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────
export default function LeaderboardMock() {
  const topThree = MOCK_USERS.slice(0, 3)
  const rest     = MOCK_USERS.slice(3)

  return (
    <div className="w-full max-w-sm flex flex-col gap-3">

      {/* Division tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800">
        {TABS.map((tab) => (
          <div
            key={tab.label}
            className={`flex items-center justify-center gap-1 rounded-xl py-2 border text-xs font-black transition-all ${
              tab.active
                ? 'bg-xp-100 text-xp-800 border-xp-400/50 shadow-sm'
                : 'text-zinc-400 border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </div>
        ))}
      </div>

      {/* Podium top 3 */}
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/50 px-3 pb-2 pt-3">
        <p className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Posisi Teratas Minggu Ini
        </p>
        <div className="grid grid-cols-3 items-end gap-1.5">
          {([2, 1, 3] as PodiumRank[]).map((r) => {
            const u = topThree[r - 1]
            return u ? (
              <PodiumCard key={r} rank={r} name={u.name} xpWeek={u.xpWeek} />
            ) : null
          })}
        </div>
      </div>

      {/* Rank 4-5 list rows */}
      <ol className="flex flex-col gap-2">
        {rest.map((u) => (
          <li
            key={u.rank}
            className="flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-800/40 px-3.5 py-2.5"
          >
            <RankBadge rank={u.rank} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-zinc-100">{u.name}</span>
              <span className="rounded bg-zinc-900/60 border border-zinc-800 px-1.5 py-px text-[9px] font-black text-zinc-400">
                Lv {Math.floor(u.xp / 500) + 1}
              </span>
            </span>
            <span className="shrink-0 flex items-center gap-1 text-sm font-black tabular-nums text-brand-600">
              <Zap size={12} className="text-brand-500" />
              {u.xpWeek.toLocaleString('id-ID')}
            </span>
          </li>
        ))}
      </ol>

      {/* Promotion zone note */}
      <div className="flex items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-100/40 px-3 py-2">
        <ArrowUp size={13} className="text-brand-600 shrink-0" />
        <p className="text-[10px] font-bold text-brand-700">
          Top 3 dengan XP tertinggi minggu ini naik divisi!
        </p>
      </div>
    </div>
  )
}
