import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat masuk ke game lesson: header nav + kolom info + board.
export default function LessonGameLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl">
      {/* Navigation header */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-700/60 pb-4">
        <SkeletonBox className="h-9 w-28 rounded-xl" />
        <div className="flex flex-col items-end gap-1.5">
          <SkeletonLine className="h-3 w-32" />
          <SkeletonLine className="h-3 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Kolom kiri: ringkasan lesson */}
        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-3xl border border-zinc-700 bg-zinc-800/50 p-5">
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="h-6 w-44" />
            <SkeletonLine className="h-3 w-32" />
            <div className="mt-2 grid grid-cols-2 gap-3">
              <SkeletonBox className="h-20 rounded-2xl" />
              <SkeletonBox className="h-20 rounded-2xl" />
            </div>
          </div>
          <SkeletonBox className="hidden min-h-[180px] rounded-3xl lg:block" />
        </aside>

        {/* Kolom kanan: papan game (dua kolom kartu) */}
        <section className="rounded-3xl border border-zinc-700 bg-zinc-800/50 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <SkeletonLine className="h-4 w-32" />
            <SkeletonBox className="h-8 w-16 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonBox key={i} className="min-h-[3.8rem] rounded-2xl" />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
