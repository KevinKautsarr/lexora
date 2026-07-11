import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat navigasi ke Leaderboard. Meniru struktur asli (hero,
// tabs divisi, podium top-3, daftar peringkat) agar transisi mulus tanpa CLS.
export default function LeaderboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      {/* Hero header — badge kanan, teks kiri */}
      <div className="flex items-start justify-between gap-4 rounded-3xl border border-zinc-700/60 bg-zinc-800/50 p-5">
        <div className="flex flex-col gap-2">
          <SkeletonBox className="h-6 w-32 rounded-full" />
          <SkeletonLine className="h-7 w-48" />
          <SkeletonLine className="h-3 w-40" />
          <SkeletonBox className="mt-1 h-7 w-36 rounded-xl" />
        </div>
        <SkeletonBox className="h-20 w-20 shrink-0 rounded-2xl" />
      </div>

      {/* Division tabs */}
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900 p-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} className="h-11 rounded-xl" />
        ))}
      </div>

      {/* Podium top-3 */}
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/50 px-4 pb-2 pt-4">
        <SkeletonLine className="mx-auto mb-3 h-3 w-40" />
        <div className="grid grid-cols-3 items-end gap-2">
          {['h-16', 'h-24', 'h-12'].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonBox className="h-11 w-11 rounded-2xl" />
              <SkeletonLine className="h-3 w-12" />
              <SkeletonBox className={`w-full rounded-t-xl ${h}`} />
            </div>
          ))}
        </div>
      </div>

      {/* List rows — avatar + teks + skor */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-800/40 px-4 py-3"
          >
            <SkeletonBox className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <SkeletonLine className="h-3.5 w-28" />
              <SkeletonLine className="h-2.5 w-12" />
            </div>
            <SkeletonLine className="h-4 w-10 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
