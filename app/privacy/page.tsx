import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Bagaimana LEXORA mengumpulkan dan melindungi datamu.',
}

const EFFECTIVE_DATE = '8 Juli 2026'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-bold text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <ChevronLeft size={18} aria-hidden />
          Kembali ke beranda
        </Link>

        <h1 className="text-3xl font-black tracking-tight text-balance">
          Kebijakan Privasi
        </h1>
        <p className="mt-2 text-sm text-zinc-400">Berlaku sejak {EFFECTIVE_DATE}</p>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-zinc-300">
          <section className="flex flex-col gap-2">
            <p>
              Privasimu penting bagi kami. Halaman ini menjelaskan data apa yang
              LEXORA kumpulkan, mengapa, dan bagaimana kami menjaganya — ditulis
              apa adanya, tanpa bahasa yang berbelit.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">1. Data yang Kami Kumpulkan</h2>
            <ul className="flex flex-col gap-1.5 pl-1">
              <li className="flex gap-2">
                <span className="text-brand-500" aria-hidden>•</span>
                <span><b className="text-zinc-100">Data akun:</b> email dan nama yang kamu masukkan saat mendaftar.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500" aria-hidden>•</span>
                <span><b className="text-zinc-100">Kata sandi:</b> disimpan dalam bentuk terenkripsi (hash) — kami tidak pernah menyimpan kata sandi aslimu.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500" aria-hidden>•</span>
                <span><b className="text-zinc-100">Progres belajar:</b> XP, streak, level, akurasi, dan pelajaran yang kamu selesaikan.</span>
              </li>
            </ul>
            <p className="mt-1">
              Kami <b className="text-zinc-100">tidak</b> mengumpulkan lokasi, kontak,
              atau data sensitif lain, dan LEXORA tidak menampilkan iklan.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">2. Bagaimana Data Digunakan</h2>
            <p>
              Data digunakan untuk menjalankan layanan: menyimpan progresmu,
              menampilkan streak &amp; XP, menyusun papan peringkat, dan menjaga
              akunmu tetap aman. Kami tidak menjual datamu kepada pihak ketiga.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">3. Papan Peringkat</h2>
            <p>
              Nama dan jumlah XP-mu dapat terlihat oleh pengguna lain di papan
              peringkat. Email dan data pribadi lainnya tidak pernah ditampilkan
              secara publik.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">4. Keamanan</h2>
            <p>
              Kami menyimpan data pada layanan basis data yang aman dan
              mengenkripsi kata sandi. Meski demikian, tidak ada sistem yang 100%
              kebal — jaga kerahasiaan kata sandimu dan gunakan kata sandi yang
              kuat.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">5. Hak Kamu</h2>
            <p>
              Kamu dapat memperbarui nama dan kata sandi kapan saja melalui halaman
              Profil. Jika kamu ingin menghapus akun beserta seluruh datamu, hubungi
              kami dan kami akan memprosesnya.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">6. Perubahan Kebijakan</h2>
            <p>
              Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan berlaku setelah
              dipublikasikan di halaman ini.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">7. Kontak</h2>
            <p>
              Lihat juga{' '}
              <Link href="/terms" className="font-semibold text-brand-500 underline hover:text-brand-400">
                Ketentuan Layanan
              </Link>{' '}
              kami untuk informasi selengkapnya.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
