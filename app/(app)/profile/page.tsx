import { Flame, Star, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getCurrentCefrLevel } from '@/lib/cefr'
import { levelForXp } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import LogoutButton from '@/components/LogoutButton'
import NameForm from './NameForm'
import PasswordForm from './PasswordForm'

export default async function ProfilePage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: {
      email: true,
      name: true,
      createdAt: true,
      xp: true,
      streak: true,
      longestStreak: true,
      startLevelOrder: true,
    },
  })

  const cefr = await getCurrentCefrLevel(sessionUser.id, user.startLevelOrder)

  const joinedAt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(
    user.createdAt,
  )
  const displayName = user.name ?? user.email
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* ── Kartu identitas: cover banner + avatar (pola Coddy, warna sage) ── */}
      <section className="overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-800/50">
        <div
          className="h-28 bg-gradient-to-br from-brand-300 to-brand-500"
          aria-hidden
        />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            <span
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-zinc-900 bg-brand-600 text-3xl font-black text-white shadow-md"
              aria-hidden
            >
              {initial}
            </span>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-xl font-black tracking-tight">{displayName}</h1>
              <p className="truncate text-sm text-zinc-400">{user.email}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Bergabung {joinedAt}</p>
        </div>
      </section>

      {/* ── Stat cards utama: Streak · XP · CEFR (pola tiga tile Coddy) ── */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-700 bg-zinc-800/50 p-4">
          <Flame size={22} className="text-orange-600" aria-hidden />
          <dd className="text-2xl font-black tabular-nums text-orange-600">{user.streak}</dd>
          <dt className="text-xs font-semibold text-zinc-500">Streak</dt>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-700 bg-zinc-800/50 p-4">
          <Zap size={22} className="text-xp-600" aria-hidden />
          <dd className="text-2xl font-black tabular-nums text-xp-600">{user.xp}</dd>
          <dt className="text-xs font-semibold text-zinc-500">Total XP</dt>
        </div>
        <div className="col-span-2 flex flex-col items-center gap-1 rounded-2xl border border-brand-300 bg-brand-100 p-4 sm:col-span-1">
          <Star size={22} className="text-brand-700" aria-hidden />
          <dd className="text-2xl font-black text-brand-700">
            {cefr ? cefr.code : `Lv ${levelForXp(user.xp)}`}
          </dd>
          <dt className="text-xs font-semibold text-brand-700">
            {cefr ? cefr.name : 'Level'}
          </dt>
        </div>
      </dl>

      {/* ── Pengaturan akun ── */}
      <section className="rounded-3xl border border-zinc-700 bg-zinc-800/50 p-6">
        <h2 className="mb-4 text-lg font-bold">Edit Nama</h2>
        <NameForm currentName={user.name ?? ''} />
      </section>

      <section className="rounded-3xl border border-zinc-700 bg-zinc-800/50 p-6">
        <h2 className="mb-4 text-lg font-bold">Ganti Password</h2>
        <PasswordForm />
      </section>

      {/* Logout — terutama untuk mobile, karena sidebar tersembunyi di sana. */}
      <LogoutButton className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-red-500/60 hover:bg-red-100 hover:text-red-600" />
    </div>
  )
}
