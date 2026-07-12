'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import {
  FREEZE_PRICE,
  MAX_FREEZES,
  BOOSTER_PRICE,
  BOOSTER_MULTIPLIER,
  BOOSTER_DURATION_MINUTES,
} from './config'

export type PurchaseState = { ok: boolean; message: string } | null

/**
 * Beli 1 streak freeze. Guard saldo & cap dilakukan ATOMIK di WHERE updateMany
 * — dua request paralel tidak bisa double-spend: yang kalah dapat count 0.
 */
export async function buyStreakFreeze(): Promise<PurchaseState> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, message: 'Harus login dulu' }

  const res = await prisma.user.updateMany({
    where: {
      id: sessionUser.id,
      gems: { gte: FREEZE_PRICE },
      streakFreezes: { lt: MAX_FREEZES },
    },
    data: {
      gems: { decrement: FREEZE_PRICE },
      streakFreezes: { increment: 1 },
    },
  })

  if (res.count === 0) {
    // Gagal karena salah satu guard — cek mana untuk pesan yang jelas.
    const u = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { gems: true, streakFreezes: true },
    })
    if (u && u.streakFreezes >= MAX_FREEZES) {
      return { ok: false, message: `Streak freeze sudah penuh (maks ${MAX_FREEZES})` }
    }
    return { ok: false, message: 'Gems kamu belum cukup' }
  }

  revalidatePath('/shop')
  revalidatePath('/streak')
  return { ok: true, message: '+1 Streak Freeze! Streak-mu aman satu hari bolong.' }
}

/**
 * Beli XP Booster 2× (30 menit). Hanya bisa saat tidak ada booster aktif —
 * mencegah pembelian yang menimpa sisa durasi (buang-buang gems).
 */
export async function buyXpBooster(): Promise<PurchaseState> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, message: 'Harus login dulu' }

  const now = new Date()
  const expiry = new Date(now.getTime() + BOOSTER_DURATION_MINUTES * 60_000)

  const res = await prisma.user.updateMany({
    where: {
      id: sessionUser.id,
      gems: { gte: BOOSTER_PRICE },
      OR: [{ boosterExpiry: null }, { boosterExpiry: { lt: now } }],
    },
    data: {
      gems: { decrement: BOOSTER_PRICE },
      boosterMultiplier: BOOSTER_MULTIPLIER,
      boosterExpiry: expiry,
    },
  })

  if (res.count === 0) {
    const u = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { gems: true, boosterExpiry: true },
    })
    if (u && u.boosterExpiry && new Date(u.boosterExpiry) > now) {
      return { ok: false, message: 'Booster masih aktif — habiskan dulu sebelum beli lagi' }
    }
    return { ok: false, message: 'Gems kamu belum cukup' }
  }

  revalidatePath('/shop')
  revalidatePath('/learn')
  return {
    ok: true,
    message: `Booster ${BOOSTER_MULTIPLIER}× aktif ${BOOSTER_DURATION_MINUTES} menit — gas belajar sekarang!`,
  }
}
