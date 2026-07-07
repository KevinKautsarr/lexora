import { Trophy, TrendingUp, Medal } from 'lucide-react'

export default function LeaderboardMock() {
  const users = [
    { rank: 1, name: 'Kevin', xp: 2450, color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    { rank: 2, name: 'Budi', xp: 2120, color: 'bg-zinc-300/20 text-zinc-300 border-zinc-300/30' },
    { rank: 3, name: 'Siti', xp: 1980, color: 'bg-amber-600/20 text-amber-600 border-amber-600/30' },
    { rank: 4, name: 'Rian', xp: 1750, color: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/30' },
    { rank: 5, name: 'Amel', xp: 1540, color: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/30' },
  ]

  return (
    <div className="w-full max-w-sm rounded-3xl border border-zinc-700/60 bg-zinc-800/80 p-5 shadow-xl backdrop-blur-md">
      {/* Widget Header */}
      <div className="mb-4 flex items-center justify-between border-b border-zinc-700/50 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={20} />
          <div>
            <h4 className="text-sm font-black text-zinc-100">Divisi Emas</h4>
            <p className="text-[10px] text-zinc-400">Papan Peringkat Mingguan</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-2 py-0.5 text-[9px] font-bold text-yellow-500">
          <TrendingUp size={10} />
          <span>Minggu 3</span>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex flex-col gap-2.5">
        {users.map((u) => (
          <div
            key={u.rank}
            className={`flex items-center justify-between rounded-xl border border-zinc-700/30 bg-zinc-900/30 p-2.5 transition-all hover:bg-zinc-900/55`}
          >
            <div className="flex items-center gap-3">
              {/* Rank indicator */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-black
                  ${u.color}
                `}
              >
                {u.rank <= 3 ? <Medal size={14} /> : <span>{u.rank}</span>}
              </div>

              {/* Avatar placeholder & Name */}
              <div className="flex items-center gap-2">
                <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-brand-600/25 text-xs font-extrabold text-brand-400">
                  {u.name[0]}
                </div>
                <span className="text-xs font-bold text-zinc-200">{u.name}</span>
              </div>
            </div>

            {/* Score */}
            <div className="font-mono text-xs font-bold text-xp-400">{u.xp} XP</div>
          </div>
        ))}
      </div>
    </div>
  )
}
