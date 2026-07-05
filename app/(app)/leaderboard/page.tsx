import { Trophy } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'

export default async function LeaderboardPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-20 text-center">
      <Trophy size={48} className="text-emerald-400" aria-hidden />
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p className="text-zinc-400">Segera hadir — kumpulkan XP sebanyak-banyaknya dulu!</p>
    </div>
  )
}
