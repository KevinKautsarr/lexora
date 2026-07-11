import { Flame, BookOpen, Zap, Gem, Trophy, Target, GraduationCap, Star, Sparkles } from 'lucide-react'
import type { Achievement } from '@/components/profile/AchievementBadges'

export type AchievementCategory = {
  id: string
  title: string
  items: Achievement[]
}

type AchievementInput = {
  streak: number
  longestStreak: number
  xp: number
  gems: number
  goldWins: number
  lessonsCompleted: number
  /** Order level CEFR yang sudah dicapai (1=A1 … 6=C2), 0 jika belum. */
  cefrOrder: number
}

/** Progres menuju milestone: nilai sekarang / target, di-clamp 0..1. */
function ratio(current: number, target: number): number {
  if (target <= 0) return 1
  return Math.max(0, Math.min(1, current / target))
}

/**
 * Bangun satu achievement per tier — tiap ambang jadi badge terpisah sehingga
 * user melihat semua milestone (yang sudah & belum). Badge yang belum diraih
 * menampilkan progres menuju ambangnya.
 */
function tierBadges(
  prefix: string,
  label: (n: number) => string,
  description: (n: number) => string,
  icon: Achievement['icon'],
  accent: Achievement['accent'],
  best: number,
  tiers: number[],
  medal?: string,
): Achievement[] {
  return tiers.map((t) => ({
    id: `${prefix}-${t}`,
    label: label(t),
    description: description(t),
    icon,
    medal,
    accent,
    earned: best >= t,
    progress: ratio(best, t),
  }))
}

const CEFR_LABELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/**
 * Susun pencapaian per kategori dari data belajar nyata (streak, lesson, XP,
 * gems, juara, level). Tanpa flag tersimpan — semua dihitung dari state user.
 */
/** Total badge yang ada di sistem — dihitung dari struktur tier yang sama
 *  dipakai buildAchievementCategories, jadi selalu akurat walau tier baru
 *  ditambahkan (satu sumber kebenaran, tidak perlu diketik ulang manual). */
export function totalAchievementCount(): number {
  return buildAchievementCategories({
    streak: 0,
    longestStreak: 0,
    xp: 0,
    gems: 0,
    goldWins: 0,
    lessonsCompleted: 0,
    cefrOrder: 0,
  }).reduce((sum, cat) => sum + cat.items.length, 0)
}

export function buildAchievementCategories(u: AchievementInput): AchievementCategory[] {
  return [
    {
      id: 'streak',
      title: 'Streak',
      items: tierBadges(
        'streak',
        (n) => `Streak ${n} Hari`,
        (n) => `Belajar ${n} hari berturut-turut`,
        Flame,
        'orange',
        u.longestStreak,
        [3, 7, 14, 30, 60, 100, 365],
        '/assets/medal-flame.png',
      ),
    },
    {
      id: 'lessons',
      title: 'Lesson',
      items: tierBadges(
        'lessons',
        (n) => `${n} Lesson`,
        (n) => `Selesaikan ${n} lesson`,
        BookOpen,
        'brand',
        u.lessonsCompleted,
        [1, 5, 10, 25, 50, 100, 250],
        '/assets/medal-book.png',
      ),
    },
    {
      id: 'xp',
      title: 'XP',
      items: tierBadges(
        'xp',
        (n) => `${n.toLocaleString('id-ID')} XP`,
        (n) => `Kumpulkan ${n.toLocaleString('id-ID')} XP`,
        Zap,
        'xp',
        u.xp,
        [500, 1000, 2500, 5000, 10000, 25000, 50000],
        '/assets/medal-lightning.png',
      ),
    },
    {
      id: 'gems',
      title: 'Gems',
      items: tierBadges(
        'gems',
        (n) => `${n} Gems`,
        (n) => `Kumpulkan ${n} gems`,
        Gem,
        'emerald',
        u.gems,
        [10, 50, 100, 300, 500, 1000],
        '/assets/medal-diamond.png',
      ),
    },
    {
      id: 'league',
      title: 'Liga',
      items: [
        ...tierBadges(
          'gold',
          (n) => (n === 1 ? 'Juara Emas' : `${n}× Juara Emas`),
          (n) => `Menang Liga Emas ${n}×`,
          Trophy,
          'purple',
          u.goldWins,
          [1, 3, 5, 10],
          '/assets/medal-laurel.png',
        ),
      ],
    },
    {
      id: 'level',
      title: 'Level CEFR',
      items: CEFR_LABELS.map((code, i) => {
        const order = i + 1
        return {
          id: `cefr-${code}`,
          label: `Level ${code}`,
          description: `Capai tingkat ${code}`,
          icon: order >= 5 ? GraduationCap : order >= 3 ? Star : Sparkles,
          medal: '/assets/medal-target.png',
          accent: (order >= 5 ? 'xp' : order >= 3 ? 'purple' : 'brand') as Achievement['accent'],
          earned: u.cefrOrder >= order,
          progress: u.cefrOrder >= order ? 1 : u.cefrOrder === order - 1 ? 0.5 : 0,
        }
      }),
    },
    {
      id: 'misc',
      title: 'Lainnya',
      items: [
        {
          id: 'streak-now',
          label: 'Streak Aktif',
          description: 'Punya streak yang sedang berjalan',
          icon: Target,
          medal: '/assets/medal-target.png',
          accent: 'sky',
          earned: u.streak > 0,
          progress: u.streak > 0 ? 1 : 0,
        },
      ],
    },
  ]
}
