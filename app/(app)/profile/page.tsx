import { Flame, Star, Zap, Shield, Target, TrendingUp, Calendar, LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getCurrentCefrLevel } from '@/lib/cefr'
import { levelForXp } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import Avatar from '@/components/Avatar'
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
      division: true,
      goldWins: true,
    },
  })

  const cefr = await getCurrentCefrLevel(sessionUser.id, user.startLevelOrder)

  const joinedAt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(user.createdAt)
  const displayName = user.name ?? user.email
  const level = levelForXp(user.xp)

  const divisionLabel =
    user.division === 'GOLD' ? 'Emas 🥇' : user.division === 'SILVER' ? 'Perak 🥈' : 'Perunggu 🥉'
  const divisionColor =
    user.division === 'GOLD'
      ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25'
      : user.division === 'SILVER'
      ? 'text-zinc-300 bg-zinc-500/10 border-zinc-500/25'
      : 'text-amber-600 bg-amber-500/10 border-amber-500/25'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">

      {/* ── Identity Card ────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl border border-zinc-700/60 bg-zinc-800/50 backdrop-blur-sm shadow-xl"
        aria-label="Kartu profil pengguna"
      >
        {/* Cover banner with gradient */}
        <div
          className="relative h-32 bg-gradient-to-br from-brand-700 via-brand-500 to-emerald-600"
          aria-hidden
        >
          {/* Decorative mesh pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
        </div>

        <div className="px-5 pb-6">
          {/* Avatar + name row */}
          <div className="-mt-10 flex items-end gap-4">
            <div className="shrink-0 overflow-hidden rounded-2xl border-4 border-zinc-900 shadow-xl ring-2 ring-brand-500/30">
              <Avatar name={displayName} size={76} />
            </div>
            <div className="mb-1 min-w-0 flex-1">
              <h1 className="truncate text-xl font-black tracking-tight text-zinc-100">
                {displayName}
              </h1>
              <p className="truncate text-xs text-zinc-400">{user.email}</p>
            </div>
            {/* CEFR badge */}
            {cefr && (
              <div className="mb-1 shrink-0 flex flex-col items-center rounded-2xl border border-brand-500/30 bg-brand-500/10 px-3 py-2">
                <span className="text-xs font-black text-brand-300">{cefr.code}</span>
                <span className="text-[9px] font-bold text-brand-500 uppercase">{cefr.name.split(' ')[0]}</span>
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${divisionColor}`}>
              <Shield size={10} />
              Liga {divisionLabel}
            </span>
            {user.goldWins > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-yellow-400">
                🏆 {user.goldWins}× Juara Emas
              </span>
            )}
            <span className="ml-auto flex items-center gap-1 text-[10px] text-zinc-500">
              <Calendar size={10} aria-hidden />
              Bergabung {joinedAt}
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats Grid ──────────────────────────────────────────── */}
      <section aria-label="Statistik performa belajar">
        <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">
          Statistik Belajar
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Streak */}
          <div className="group flex flex-col items-center gap-2 rounded-2xl border border-zinc-700/60 bg-zinc-800/50 p-4 transition-colors hover:border-orange-500/30 hover:bg-orange-500/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame size={20} className="text-orange-500" aria-hidden />
            </div>
            <dd className="text-3xl font-black tabular-nums text-orange-400 leading-none">
              {user.streak}
            </dd>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Streak</dt>
          </div>

          {/* Total XP */}
          <div className="group flex flex-col items-center gap-2 rounded-2xl border border-zinc-700/60 bg-zinc-800/50 p-4 transition-colors hover:border-brand-500/30 hover:bg-brand-500/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
              <Zap size={20} className="text-brand-400" aria-hidden />
            </div>
            <dd className="text-3xl font-black tabular-nums text-brand-400 leading-none">
              {user.xp.toLocaleString('id-ID')}
            </dd>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total XP</dt>
          </div>

          {/* Level */}
          <div className="group flex flex-col items-center gap-2 rounded-2xl border border-zinc-700/60 bg-zinc-800/50 p-4 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Star size={20} className="text-emerald-400" aria-hidden />
            </div>
            <dd className="text-3xl font-black tabular-nums text-emerald-400 leading-none">
              {cefr ? cefr.code : `${level}`}
            </dd>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {cefr ? 'Level CEFR' : 'Level'}
            </dt>
          </div>

          {/* Longest Streak */}
          <div className="group flex flex-col items-center gap-2 rounded-2xl border border-zinc-700/60 bg-zinc-800/50 p-4 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
              <TrendingUp size={20} className="text-purple-400" aria-hidden />
            </div>
            <dd className="text-3xl font-black tabular-nums text-purple-400 leading-none">
              {user.longestStreak}
            </dd>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Streak Terbaik</dt>
          </div>
        </dl>
      </section>

      {/* ── Account Settings ────────────────────────────────────── */}
      <section
        className="overflow-hidden rounded-3xl border border-zinc-700/60 bg-zinc-800/40 backdrop-blur-sm"
        aria-labelledby="settings-heading"
      >
        <div className="border-b border-zinc-700/50 px-5 py-4">
          <h2 id="settings-heading" className="flex items-center gap-2 text-sm font-black text-zinc-100">
            <Target size={16} className="text-brand-500" aria-hidden />
            Pengaturan Akun
          </h2>
        </div>

        {/* Edit Name */}
        <div className="border-b border-zinc-700/40 px-5 py-5">
          <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-zinc-400">
            Nama Tampilan
          </h3>
          <NameForm currentName={user.name ?? ''} />
        </div>

        {/* Change Password */}
        <div className="px-5 py-5">
          <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-zinc-400">
            Ganti Password
          </h3>
          <PasswordForm />
        </div>
      </section>

      {/* ── Danger Zone ─────────────────────────────────────────── */}
      <section
        className="rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-5"
        aria-label="Zona berbahaya"
      >
        <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500">
          <LogOut size={13} aria-hidden />
          Keluar dari Akun
        </h2>
        <p className="mb-4 text-xs text-zinc-500 leading-relaxed">
          Kamu akan dikeluarkan dari sesi aktif. Data belajar kamu tetap aman dan tersimpan.
        </p>
        <LogoutButton className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700/60 bg-zinc-800/60 px-5 py-3 text-sm font-bold text-zinc-400 transition-all duration-150 hover:border-rose-500/40 hover:bg-rose-500/8 hover:text-rose-400 cursor-pointer" />
      </section>
    </div>
  )
}
