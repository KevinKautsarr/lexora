import { redirect } from 'next/navigation'
import { levelForXp } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
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
    },
  })

  const joinedAt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(
    user.createdAt,
  )

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Info akun + statistik ringkas */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6">
        <p className="text-lg font-bold">{user.name ?? user.email}</p>
        <p className="text-sm text-zinc-400">{user.email}</p>
        <p className="mt-1 text-sm text-zinc-400">Bergabung {joinedAt}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-zinc-900 p-3 text-center">
            <dt className="text-xs text-zinc-500">Level</dt>
            <dd className="text-xl font-bold text-emerald-400">{levelForXp(user.xp)}</dd>
          </div>
          <div className="rounded-xl bg-zinc-900 p-3 text-center">
            <dt className="text-xs text-zinc-500">XP</dt>
            <dd className="text-xl font-bold">{user.xp}</dd>
          </div>
          <div className="rounded-xl bg-zinc-900 p-3 text-center">
            <dt className="text-xs text-zinc-500">Streak</dt>
            <dd className="text-xl font-bold text-orange-400">{user.streak}</dd>
          </div>
          <div className="rounded-xl bg-zinc-900 p-3 text-center">
            <dt className="text-xs text-zinc-500">Streak terpanjang</dt>
            <dd className="text-xl font-bold">{user.longestStreak}</dd>
          </div>
        </dl>
      </section>

      {/* Edit nama */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6">
        <h2 className="mb-4 text-lg font-bold">Edit Nama</h2>
        <NameForm currentName={user.name ?? ''} />
      </section>

      {/* Ganti password */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6">
        <h2 className="mb-4 text-lg font-bold">Ganti Password</h2>
        <PasswordForm />
      </section>
    </div>
  )
}
