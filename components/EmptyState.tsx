import type { ReactNode } from 'react'
import Image from 'next/image'
import Mascot, { type MascotPose } from './Mascot'

// Kondisi kosong yang konsisten: ilustrasi + judul + deskripsi + aksi opsional.
// Ilustrasi bisa berupa maskot (mood/pose) ATAU aset gambar khusus (mis.
// treasure-map). Dipakai menggantikan empty state teks-only (leaderboard,
// materi, dll).
export default function EmptyState({
  title,
  description,
  action,
  mood = 'sad',
  pose,
  image,
}: {
  title: string
  description?: string
  action?: ReactNode
  mood?: 'happy' | 'cheer' | 'sad'
  /** Pose maskot spesifik (mis. 'reading'). Menang atas `mood`. */
  pose?: MascotPose
  /** Aset gambar khusus (mis. '/assets/treasure-map.png'). Menang atas maskot. */
  image?: { src: string; ratio: number; width?: number }
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/40 px-6 py-12 text-center">
      {image ? (
        <span
          className="relative select-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
          style={{
            width: image.width ?? 120,
            height: Math.round((image.width ?? 120) / image.ratio),
          }}
        >
          <Image
            src={image.src}
            alt=""
            fill
            sizes={`${image.width ?? 120}px`}
            className="object-contain"
          />
        </span>
      ) : pose ? (
        <Mascot pose={pose} size={88} />
      ) : (
        <Mascot mood={mood} size={88} />
      )}
      <h2 className="text-lg font-bold text-zinc-100 text-balance">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-zinc-400 text-pretty">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
