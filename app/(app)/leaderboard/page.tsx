import { Crown, Medal, Trophy } from 'lucide-react'
import { redirect } from 'next/navigation'
import { levelForXp } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

const TOP_LIMIT = 20

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={20} className="text-amber-600" aria-label="Peringkat 1" />
  if (rank === 2) return <Medal size={20} className="text-zinc-300" aria-label="Peringkat 2" />
  if (rank === 3) return <Medal size={20} className="text-amber-700" aria-label="Peringkat 3" />
  return <span className="w-5 text-center text-sm font-bold text-zinc-500">{rank}</span>
}

function Row({
  rank,
  name,
  xp,
  isMe,
}: {
  rank: number
  name: string
  xp: number
  isMe: boolean
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        isMe
          ? 'border-brand-600 bg-brand-100'
          : rank <= 3
            ? 'border-zinc-700 bg-zinc-800/80'
            : 'border-zinc-800 bg-zinc-800/40'
      }`}
    >
      <span className="flex w-6 shrink-0 justify-center">
        <RankBadge rank={rank} />
      </span>
      <span
        className={`min-w-0 flex-1 truncate font-semibold ${
          isMe ? 'text-brand-700' : 'text-zinc-100'
        }`}
      >
        {name}
        {isMe && <span className="ml-2 text-xs font-bold text-brand-600">(kamu)</span>}
      </span>
      <span className="shrink-0 rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-bold text-zinc-400">
        Lv {levelForXp(xp)}
      </span>
      <span className="w-20 shrink-0 text-right text-sm font-bold tabular-nums text-xp-600">
        {xp.toLocaleString('id-ID')} XP
      </span>
    </li>
  )
}

export default async function LeaderboardPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  // Hanya nama yang diambil — email user lain tidak pernah dikirim ke client.
  const [topUsers, me] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
      take: TOP_LIMIT,
      select: { id: true, name: true, xp: true },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: { id: true, name: true, xp: true, createdAt: true },
    }),
  ])

  const inTop = topUsers.some((u) => u.id === me.id)

  // Rank user login: jumlah user dengan XP lebih tinggi (atau XP sama tapi
  // lebih dulu daftar, konsisten dengan urutan daftar) + 1.
  const myRank =
    (await prisma.user.count({
      where: {
        OR: [
          { xp: { gt: me.xp } },
          { xp: me.xp, createdAt: { lt: me.createdAt } },
        ],
      },
    })) + 1

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <header className="flex items-center gap-3">
        <Trophy size={28} className="text-brand-600" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-zinc-400">
            Peringkat berdasarkan total XP — posisimu: #{myRank}
          </p>
        </div>
      </header>

      {topUsers.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-800/40 px-6 py-10 text-center text-sm text-zinc-400">
          Belum ada peringkat. Selesaikan lesson pertamamu untuk masuk papan
          peringkat!
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {topUsers.map((user, index) => (
            <Row
              key={user.id}
              rank={index + 1}
              name={user.name ?? 'Pelajar'}
              xp={user.xp}
              isMe={user.id === me.id}
            />
          ))}
        </ol>
      )}

      {!inTop && (
        <>
          <p className="text-center text-xs font-bold tracking-widest text-zinc-600">• • •</p>
          <ol>
            <Row rank={myRank} name={me.name ?? 'Pelajar'} xp={me.xp} isMe />
          </ol>
        </>
      )}
    </div>
  )
}
