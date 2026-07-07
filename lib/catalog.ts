import 'server-only'
import { cache } from 'react'
import { prisma } from './prisma'

// Katalog materi (level → unit → lesson) itu data statis yang sama untuk semua
// pengguna. Dibungkus React.cache() supaya query berat ini hanya jalan SEKALI
// per request meski dibutuhkan beberapa komponen (mis. learn/page +
// NextLessonCard yang tadinya menembak query identik masing-masing).

/** Semua unit terurut, lengkap dengan level & lesson-nya. */
export const getUnitsWithLessons = cache(async () => {
  return prisma.unit.findMany({
    orderBy: [{ level: { order: 'asc' } }, { order: 'asc' }],
    include: { level: true, lessons: { orderBy: { order: 'asc' } } },
  })
})

/** Semua level terurut, lengkap dengan unit & lesson-nya (dipakai Journey). */
export const getLevelsWithUnits = cache(async () => {
  return prisma.level.findMany({
    orderBy: { order: 'asc' },
    include: {
      units: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  })
})
