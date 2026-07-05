'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

// Satu-satunya jalur mutasi onboarding. Level terendah (A1) di-set langsung;
// level lain diarahkan ke placement test — jadi startLevelOrder > 1 TIDAK
// pernah bisa di-set langsung dari client lewat action ini.
export async function chooseLevel(levelOrder: number) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { onboarded: true },
  })
  if (user.onboarded) redirect('/learn')

  if (!Number.isInteger(levelOrder)) throw new Error('Level tidak valid')
  const level = await prisma.level.findUnique({ where: { order: levelOrder } })
  if (!level) throw new Error('Level tidak valid')

  const lowest = await prisma.level.findFirstOrThrow({
    orderBy: { order: 'asc' },
    select: { order: true },
  })

  if (level.order === lowest.order) {
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { startLevelOrder: level.order, onboarded: true },
    })
    redirect('/learn')
  }

  redirect(`/onboarding/test?target=${level.order}`)
}
