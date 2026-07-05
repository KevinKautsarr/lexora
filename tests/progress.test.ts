import { describe, expect, it } from 'vitest'
import { computeUnlockedLessonIds, findNextLessonRef, isLessonUnlocked } from '@/lib/progress'

// Tiga lesson lintas dua unit dalam satu level, sengaja dalam urutan acak
// untuk memastikan fungsi men-sort sendiri (level → unit → lesson).
const LESSONS = [
  { id: 'b1', order: 1, unitOrder: 2, levelOrder: 1 },
  { id: 'a2', order: 2, unitOrder: 1, levelOrder: 1 },
  { id: 'a1', order: 1, unitOrder: 1, levelOrder: 1 },
]

describe('computeUnlockedLessonIds (satu level)', () => {
  it('tanpa progress: hanya lesson global pertama yang terbuka', () => {
    const unlocked = computeUnlockedLessonIds(LESSONS, new Set())
    expect(unlocked.has('a1')).toBe(true)
    expect(unlocked.has('a2')).toBe(false)
    expect(unlocked.has('b1')).toBe(false)
  })

  it('lesson terbuka setelah pendahulunya completed', () => {
    const unlocked = computeUnlockedLessonIds(LESSONS, new Set(['a1']))
    expect(unlocked.has('a2')).toBe(true)
    expect(unlocked.has('b1')).toBe(false)
  })

  it('lintas unit: lesson terakhir unit 1 membuka lesson pertama unit 2', () => {
    const unlocked = computeUnlockedLessonIds(LESSONS, new Set(['a1', 'a2']))
    expect(unlocked.has('b1')).toBe(true)
  })

  it('lesson completed selalu terbuka (bisa dimainkan ulang)', () => {
    const unlocked = computeUnlockedLessonIds(LESSONS, new Set(['a2']))
    expect(unlocked.has('a2')).toBe(true)
    expect(unlocked.has('a1')).toBe(true)
    expect(unlocked.has('b1')).toBe(true)
  })

  it('daftar kosong: tidak ada yang terbuka', () => {
    expect(computeUnlockedLessonIds([], new Set()).size).toBe(0)
  })
})

// Dua level × masing-masing 2 lesson.
const LEVELED = [
  { id: 'l1-a', order: 1, unitOrder: 1, levelOrder: 1 },
  { id: 'l1-b', order: 2, unitOrder: 1, levelOrder: 1 },
  { id: 'l2-a', order: 1, unitOrder: 1, levelOrder: 2 },
  { id: 'l2-b', order: 2, unitOrder: 1, levelOrder: 2 },
]

describe('computeUnlockedLessonIds (startLevelOrder)', () => {
  it('startLevelOrder 2: semua level 1 terbuka bebas, rantai mulai di l2-a', () => {
    const unlocked = computeUnlockedLessonIds(LEVELED, new Set(), 2)
    expect(unlocked.has('l1-a')).toBe(true)
    expect(unlocked.has('l1-b')).toBe(true)
    expect(unlocked.has('l2-a')).toBe(true)
    expect(unlocked.has('l2-b')).toBe(false)
  })

  it('menyelesaikan lesson level bawah TIDAK membuka rantai level start', () => {
    const unlocked = computeUnlockedLessonIds(LEVELED, new Set(['l1-a', 'l1-b']), 2)
    expect(unlocked.has('l2-b')).toBe(false)
  })

  it('rantai lintas level: lesson terakhir level 1 membuka level 2 (start 1)', () => {
    const unlocked = computeUnlockedLessonIds(LEVELED, new Set(['l1-a', 'l1-b']), 1)
    expect(unlocked.has('l2-a')).toBe(true)
    expect(unlocked.has('l2-b')).toBe(false)
  })
})

describe('findNextLessonRef', () => {
  it('menunjuk lesson rantai pertama yang belum completed, bukan level bebas', () => {
    expect(findNextLessonRef(LEVELED, new Set(), 2)?.id).toBe('l2-a')
    expect(findNextLessonRef(LEVELED, new Set(['l2-a']), 2)?.id).toBe('l2-b')
  })

  it('null saat seluruh rantai selesai', () => {
    expect(findNextLessonRef(LEVELED, new Set(['l2-a', 'l2-b']), 2)).toBeNull()
  })
})

describe('isLessonUnlocked', () => {
  it('konsisten dengan computeUnlockedLessonIds', () => {
    expect(isLessonUnlocked('a1', LESSONS, new Set())).toBe(true)
    expect(isLessonUnlocked('b1', LESSONS, new Set())).toBe(false)
    expect(isLessonUnlocked('l1-b', LEVELED, new Set(), 2)).toBe(true)
  })
})
