// Latar dekoratif "adventure map" untuk Journey — memadukan gradient tema
// (adaptif light/dark) dengan aset PNG environment bergaya ilustrasi (pohon,
// papan penunjuk, batu, semak, api unggun, awan). Semua elemen non-interaktif
// & di belakang konten (z-index 0), opacity ditekan agar node/teks tetap
// kontras. Ditempatkan di sisi/tepi supaya tidak menutupi jalur node tengah.
//
// Dipasang sebagai layer absolut di dalam wrapper Journey yang `relative`.

import Image from 'next/image'

// Aksen PNG environment: posisi (kelas Tailwind), ukuran dasar, rasio w/h asli,
// dan opacity per elemen. Ditata di dua tepi + beberapa awan atas.
type EnvAccent = {
  src: string
  className: string
  width: number
  ratio: number // w / h
  opacity: number
}

const ENV: EnvAccent[] = [
  // Pohon besar — jangkar visual di kiri atas & kanan bawah.
  { src: '/assets/env-tree.png', className: 'left-[-2%] top-[8%]', width: 120, ratio: 752 / 1275, opacity: 0.85 },
  { src: '/assets/env-tree.png', className: 'right-[-3%] top-[52%] -scale-x-100', width: 104, ratio: 752 / 1275, opacity: 0.7 },
  // Papan penunjuk — sentuhan "peta petualangan".
  { src: '/assets/env-signpost.png', className: 'left-[3%] top-[40%]', width: 76, ratio: 522 / 603, opacity: 0.8 },
  // Api unggun — kehangatan di tepi bawah.
  { src: '/assets/env-campfire.png', className: 'right-[5%] top-[80%]', width: 72, ratio: 514 / 591, opacity: 0.8 },
  // Batu & semak — pengisi dasar.
  { src: '/assets/env-rock.png', className: 'left-[7%] top-[72%]', width: 84, ratio: 521 / 373, opacity: 0.7 },
  { src: '/assets/env-bush.png', className: 'right-[8%] top-[26%]', width: 80, ratio: 623 / 467, opacity: 0.7 },
  { src: '/assets/env-bush.png', className: 'left-[10%] top-[90%]', width: 64, ratio: 623 / 467, opacity: 0.6 },
  // Awan mengambang di atas.
  { src: '/assets/env-cloud.png', className: 'left-[18%] top-[3%]', width: 96, ratio: 668 / 447, opacity: 0.55 },
  { src: '/assets/env-cloud.png', className: 'right-[16%] top-[10%]', width: 76, ratio: 668 / 447, opacity: 0.45 },
]

export default function JourneyScenery() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Gradient dasar bertingkat — memberi kedalaman halus, bukan warna flat.
          Memakai token tema (brand) via warna transparan agar ikut light/dark. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--color-brand-300) 22%, transparent), transparent 70%), radial-gradient(ellipse 70% 60% at 50% 100%, color-mix(in srgb, var(--color-brand-400) 14%, transparent), transparent 65%)',
        }}
      />

      {/* Aksen PNG environment — ditempatkan di tepi, opacity ditekan agar
          jalur node tengah tetap kontras. */}
      {ENV.map((e, i) => (
        <span
          key={`${e.src}-${i}`}
          className={`absolute select-none ${e.className}`}
          style={{
            width: e.width,
            height: Math.round(e.width / e.ratio),
            opacity: e.opacity,
          }}
        >
          <Image
            src={e.src}
            alt=""
            fill
            sizes={`${e.width}px`}
            className="object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          />
        </span>
      ))}

      {/* Tekstur dot halus — memecah bidang datar tanpa mengganggu. */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(color-mix(in srgb, var(--color-brand-500) 30%, transparent) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}
