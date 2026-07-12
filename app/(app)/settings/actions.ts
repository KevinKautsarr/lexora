'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { verifyPassword } from 'better-auth/crypto'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export type UpdateNameState = { ok: boolean; message: string } | null

const MAX_NAME_LENGTH = 50

export async function updateName(
  _prev: UpdateNameState,
  formData: FormData,
): Promise<UpdateNameState> {
  // Validasi session di server — action ini endpoint publik, bukan cuma UI.
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, message: 'Harus login dulu' }

  const raw = formData.get('name')
  const name = typeof raw === 'string' ? raw.trim() : ''
  if (name.length === 0) return { ok: false, message: 'Nama tidak boleh kosong' }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, message: `Nama maksimal ${MAX_NAME_LENGTH} karakter` }
  }

  await prisma.user.update({ where: { id: sessionUser.id }, data: { name } })
  // Nama tampil di banyak tempat (profile, leaderboard, sidebar) → revalidate
  // kedua halaman utama yang menampilkannya.
  revalidatePath('/settings')
  revalidatePath('/profile')
  return { ok: true, message: 'Nama berhasil diperbarui' }
}

// ── Pengingat belajar (in-app) ──────────────────────────────────────
export type ReminderState = { ok: boolean; message: string } | null

/** Simpan preferensi pengingat harian: aktif/tidak + jam (WIB). */
export async function updateReminder(
  _prev: ReminderState,
  formData: FormData,
): Promise<ReminderState> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, message: 'Harus login dulu' }

  const enabled = formData.get('enabled') === 'on'
  const hourRaw = formData.get('hour')
  const hour = typeof hourRaw === 'string' ? Number.parseInt(hourRaw, 10) : NaN
  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    return { ok: false, message: 'Jam pengingat tidak valid' }
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { reminderEnabled: enabled, reminderHour: hour },
  })
  revalidatePath('/settings')
  revalidatePath('/learn')
  return {
    ok: true,
    message: enabled ? `Pengingat aktif jam ${String(hour).padStart(2, '0')}:00` : 'Pengingat dimatikan',
  }
}

// ── Sesi aktif ──────────────────────────────────────────────────────
export type ActiveSession = {
  id: string
  createdAt: string // ISO — diformat di client agar tak ada mismatch tz
  ipAddress: string | null
  userAgent: string | null
  isCurrent: boolean
}

/**
 * Daftar sesi login aktif user, menandai sesi perangkat saat ini.
 * Dibaca langsung via Prisma (read-only) — BUKAN auth.api.listSessions,
 * karena endpoint itu menerapkan cek "session freshness" dan melempar
 * SESSION_NOT_FRESH jika sesi > freshAge, yang akan meng-500-kan page load.
 */
export async function listActiveSessions(): Promise<ActiveSession[]> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return []

  const h = await headers()
  // getSession tidak butuh freshness — aman untuk menandai sesi saat ini.
  const current = await auth.api.getSession({ headers: h }).catch(() => null)
  const currentToken = current?.session.token

  const sessions = await prisma.session.findMany({
    where: { userId: sessionUser.id, expiresAt: { gt: new Date() } },
    select: { id: true, token: true, createdAt: true, ipAddress: true, userAgent: true },
    orderBy: { createdAt: 'desc' },
  })

  return sessions.map((s) => ({
    id: s.id,
    createdAt: new Date(s.createdAt).toISOString(),
    ipAddress: s.ipAddress ?? null,
    userAgent: s.userAgent ?? null,
    isCurrent: s.token === currentToken,
  }))
}

export type RevokeState = { ok: boolean; message: string } | null

/** Keluarkan semua sesi selain perangkat saat ini. */
export async function revokeOtherSessions(): Promise<RevokeState> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, message: 'Harus login dulu' }

  try {
    const h = await headers()
    await auth.api.revokeOtherSessions({ headers: h })
    revalidatePath('/settings')
    return { ok: true, message: 'Berhasil keluar dari perangkat lain' }
  } catch {
    return { ok: false, message: 'Gagal mengeluarkan perangkat lain' }
  }
}

// ── Hapus akun ──────────────────────────────────────────────────────
export type DeleteAccountState = { ok: boolean; message: string } | null

/**
 * Hapus akun permanen. Konfirmasi berlapis:
 * - Semua user: ketik ulang email (dicocokkan di server).
 * - User credential: WAJIB password juga — sesi yang dicuri saja tidak cukup
 *   untuk memusnahkan akun. User Google-only tidak punya password, jadi
 *   untuk mereka konfirmasi email adalah satu-satunya lapisan.
 * Relasi (session, progress, dll) ikut terhapus lewat onDelete: Cascade.
 */
export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, message: 'Harus login dulu' }

  const confirmRaw = formData.get('confirm')
  const confirm = typeof confirmRaw === 'string' ? confirmRaw.trim() : ''
  if (confirm.toLowerCase() !== sessionUser.email.toLowerCase()) {
    return { ok: false, message: 'Email konfirmasi tidak cocok' }
  }

  const credential = await prisma.account.findFirst({
    where: { userId: sessionUser.id, providerId: 'credential' },
    select: { password: true },
  })
  if (credential?.password) {
    const passwordRaw = formData.get('password')
    const password = typeof passwordRaw === 'string' ? passwordRaw : ''
    if (!password) return { ok: false, message: 'Masukkan password untuk konfirmasi' }
    const valid = await verifyPassword({ hash: credential.password, password })
    if (!valid) return { ok: false, message: 'Password salah' }
  }

  // Keluarkan semua sesi lalu hapus user (cascade menghapus data terkait).
  const h = await headers()
  await auth.api.revokeSessions({ headers: h }).catch(() => {})
  await prisma.user.delete({ where: { id: sessionUser.id } })
  return { ok: true, message: 'Akun berhasil dihapus' }
}
