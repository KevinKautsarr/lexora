import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat navigasi ke Goals. Meniru struktur: header + kartu goal
// (3 baris progress + peti) + kartu "taklukkan semua" + kutipan.
export default function GoalsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Header: judul + countdown */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SkeletonLine className="h-8 w-40" />
        <SkeletonBox className="h-8 w-32 rounded-full" />
      </div>

      {/* Kartu goal — 3 baris (label + bar + peti) */}
      <div className="flex flex-col gap-5 rounded-3xl border border-zinc-700 bg-zinc-800/50 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <SkeletonLine className="h-4 w-44" />
              <SkeletonLine className="h-4 w-10" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonBox className="h-3 flex-1 rounded-full" />
              <SkeletonBox className="h-7 w-7 shrink-0 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Taklukkan semua */}
      <div className="flex items-center gap-4 rounded-3xl border border-zinc-700 bg-zinc-800/50 p-6">
        <SkeletonBox className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonLine className="h-5 w-40" />
          <SkeletonLine className="h-3 w-full max-w-xs" />
        </div>
      </div>

      {/* Kutipan */}
      <div className="flex items-start gap-3 rounded-3xl border border-zinc-700 bg-zinc-800/30 p-6">
        <SkeletonBox className="h-5 w-5 shrink-0 rounded" />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonLine className="h-3 w-28" />
          <SkeletonLine className="h-4 w-full max-w-sm" />
        </div>
      </div>
    </div>
  )
}
