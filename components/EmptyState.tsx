import type { ReactNode } from 'react'
import Mascot from './Mascot'

// Kondisi kosong yang konsisten: maskot + judul + deskripsi + aksi opsional.
// Dipakai menggantikan empty state teks-only (leaderboard, materi, dll).
export default function EmptyState({
  title,
  description,
  action,
  mood = 'sad',
}: {
  title: string
  description?: string
  action?: ReactNode
  mood?: 'happy' | 'cheer' | 'sad'
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/40 px-6 py-12 text-center">
      <Mascot mood={mood} size={88} />
      <h2 className="text-lg font-bold text-zinc-100 text-balance">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-zinc-400 text-pretty">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
