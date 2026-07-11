import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat navigasi ke Streak. Meniru struktur layout asli
// (dua panel sejajar, isi tiap panel) agar tidak ada layout shift saat data
// ter-stream masuk. Responsif: 1 kolom di mobile, 2 kolom sejajar di md+.
export default function StreakLoading() {
  return (
    <div className="flex w-full justify-center px-1 py-4">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 px-2 sm:px-4 md:grid-cols-[1fr_1.1fr] md:items-stretch">
        {/* ── PANEL KIRI ── */}
        <div className="flex h-full flex-col gap-5 rounded-3xl border border-zinc-700 bg-zinc-800/70 p-5">
          {/* Judul */}
          <SkeletonLine className="h-6 w-28 border-b border-zinc-700 pb-3" />
          {/* Streak besar + flame */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex flex-col gap-2">
              <SkeletonBox className="h-14 w-16" />
              <SkeletonLine className="h-4 w-24" />
            </div>
            <SkeletonBox className="h-24 w-24 rounded-full" />
          </div>
          {/* Perfect streak card */}
          <SkeletonBox className="h-16 w-full rounded-2xl" />
          {/* Level & Akurasi (2 kolom) */}
          <div className="grid grid-cols-2 gap-3">
            <SkeletonBox className="h-16 rounded-2xl" />
            <SkeletonBox className="h-16 rounded-2xl" />
          </div>
          {/* Rekor terbaik */}
          <SkeletonBox className="mt-auto h-14 w-full rounded-2xl" />
        </div>

        {/* ── PANEL KANAN (kalender) ── */}
        <div className="flex h-full flex-col gap-4 rounded-3xl border border-zinc-700 bg-zinc-800/70 p-5">
          {/* Header bulan + navigasi */}
          <div className="flex items-center justify-between">
            <SkeletonLine className="h-6 w-32" />
            <div className="flex gap-2">
              <SkeletonBox className="h-8 w-8" />
              <SkeletonBox className="h-8 w-8" />
            </div>
          </div>
          {/* Freeze card */}
          <SkeletonBox className="h-14 w-full rounded-2xl" />
          {/* Grid kalender */}
          <div className="rounded-3xl border border-zinc-700 p-5">
            {/* Header hari */}
            <div className="mb-3 grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonLine key={i} className="mx-auto h-3 w-5" />
              ))}
            </div>
            {/* 5 baris minggu */}
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, r) => (
                <div key={r} className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, c) => (
                    <SkeletonBox key={c} className="mx-auto h-8 w-8 rounded-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
