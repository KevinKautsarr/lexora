import { Settings, UserPen, KeyRound, LogOut, ArrowLeft, MonitorSmartphone, Trash2, Bell, Palette } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import LogoutButton from '@/components/LogoutButton'
import NameForm from './NameForm'
import PasswordForm from './PasswordForm'
import ReminderForm from './ReminderForm'
import ThemeToggle from './ThemeToggle'
import SoundToggle from './SoundToggle'
import SessionsList from './SessionsList'
import DeleteAccountForm from './DeleteAccountForm'
import { listActiveSessions } from './actions'


export const metadata = { title: 'Pengaturan' }

export default async function SettingsPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const [user, sessions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: { name: true, email: true, reminderEnabled: true, reminderHour: true },
    }),
    listActiveSessions(),
  ])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="Kembali ke profil"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/50 text-zinc-400 transition-colors hover:border-brand-500/40 hover:text-brand-500"
        >
          <ArrowLeft size={18} aria-hidden />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-zinc-100">
            <Settings size={24} className="text-brand-600" aria-hidden />
            Pengaturan
          </h1>
          <p className="text-xs text-zinc-500">{user.email}</p>
        </div>
      </header>

      {/* ── Tampilan (Tema) ─────────────────────────────────────── */}
      <section
        className="rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-5 sm:p-6"
        aria-labelledby="theme-heading"
      >
        <h2 id="theme-heading" className="mb-4 flex items-center gap-2 text-sm font-black text-zinc-100">
          <Palette size={16} className="text-brand-500" aria-hidden />
          Tampilan
        </h2>
        <ThemeToggle />
        <div className="mt-5 border-t border-zinc-700/50 pt-5">
          <SoundToggle />
        </div>
      </section>

      {/* ── Nama Tampilan ───────────────────────────────────────── */}
      <section
        className="rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-5 sm:p-6"
        aria-labelledby="name-heading"
      >
        <h2 id="name-heading" className="mb-4 flex items-center gap-2 text-sm font-black text-zinc-100">
          <UserPen size={16} className="text-brand-500" aria-hidden />
          Nama Tampilan
        </h2>
        <NameForm currentName={user.name ?? ''} />
      </section>

      {/* ── Ganti Password ──────────────────────────────────────── */}
      <section
        className="rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-5 sm:p-6"
        aria-labelledby="password-heading"
      >
        <h2 id="password-heading" className="mb-4 flex items-center gap-2 text-sm font-black text-zinc-100">
          <KeyRound size={16} className="text-brand-500" aria-hidden />
          Ganti Password
        </h2>
        <PasswordForm />
      </section>

      {/* ── Pengingat Belajar ───────────────────────────────────── */}
      <section
        className="rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-5 sm:p-6"
        aria-labelledby="reminder-heading"
      >
        <h2 id="reminder-heading" className="mb-4 flex items-center gap-2 text-sm font-black text-zinc-100">
          <Bell size={16} className="text-brand-500" aria-hidden />
          Pengingat Belajar
        </h2>
        <ReminderForm enabled={user.reminderEnabled} hour={user.reminderHour} />
      </section>

      {/* ── Sesi & Perangkat Aktif ──────────────────────────────── */}
      <section
        className="rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-5 sm:p-6"
        aria-labelledby="sessions-heading"
      >
        <h2 id="sessions-heading" className="mb-1 flex items-center gap-2 text-sm font-black text-zinc-100">
          <MonitorSmartphone size={16} className="text-brand-500" aria-hidden />
          Sesi &amp; Perangkat
        </h2>
        <p className="mb-4 text-xs text-zinc-500 leading-relaxed">
          Perangkat yang sedang login ke akunmu. Keluarkan yang tidak kamu kenali.
        </p>
        <SessionsList sessions={sessions} />
      </section>

      {/* ── Keluar dari Akun — hanya di mobile; desktop punya Logout di sidebar ── */}
      <section
        className="rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-5 lg:hidden"
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

      {/* ── Hapus Akun (danger zone, permanen) ──────────────────── */}
      <section
        className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5 sm:p-6"
        aria-labelledby="delete-heading"
      >
        <h2 id="delete-heading" className="mb-4 flex items-center gap-2 text-sm font-black text-rose-400">
          <Trash2 size={16} aria-hidden />
          Hapus Akun
        </h2>
        <DeleteAccountForm email={user.email} />
      </section>
    </div>
  )
}
