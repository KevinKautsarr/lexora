import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat navigasi ke Profile. Meniru: kartu identitas (banner +
// avatar + nama + badge) dan grid statistik 4 kotak (responsif 2→4 kolom).
export default function ProfileLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Identity card */}
      <div className="overflow-hidden rounded-3xl border border-zinc-700/60 bg-zinc-800/50">
        {/* Banner */}
        <SkeletonBox className="h-20 w-full rounded-none" />
        <div className="px-5 pb-6">
          {/* Avatar + nama */}
          <div className="-mt-10 flex items-end gap-4">
            <SkeletonBox className="h-[76px] w-[76px] shrink-0 rounded-2xl border-4 border-zinc-900" />
            <div className="mb-1 flex flex-1 flex-col gap-2">
              <SkeletonLine className="h-5 w-32" />
              <SkeletonLine className="h-3 w-40" />
            </div>
          </div>
          {/* Meta badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SkeletonBox className="h-6 w-28 rounded-full" />
            <SkeletonBox className="ml-auto h-4 w-32 rounded" />
          </div>
        </div>
      </div>

      {/* Stats grid — 2 kolom mobile, 4 kolom sm+ */}
      <div>
        <SkeletonLine className="mb-3 h-4 w-32" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-700/60 bg-zinc-800/50 p-4"
            >
              <SkeletonBox className="h-10 w-10 rounded-xl" />
              <SkeletonLine className="h-7 w-10" />
              <SkeletonLine className="h-2.5 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
