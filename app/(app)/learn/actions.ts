'use server'

import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function clearPreviousDivision() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, error: 'Unauthorized' }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { previousDivision: null },
  })

  revalidatePath('/learn')
  revalidatePath('/leaderboard')
  return { ok: true }
}
