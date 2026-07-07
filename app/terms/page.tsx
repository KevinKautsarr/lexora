import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ketentuan Layanan',
  description: 'Ketentuan penggunaan layanan LEXORA.',
}

// Tanggal berlaku — perbarui saat ketentuan diubah.
const EFFECTIVE_DATE = '8 Juli 2026'

export default function TermsPage() {
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
          Ketentuan Layanan
        </h1>
        <p className="mt-2 text-sm text-zinc-400">Berlaku sejak {EFFECTIVE_DATE}</p>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-zinc-300">
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan membuat akun atau menggunakan LEXORA, kamu setuju untuk terikat
              pada Ketentuan Layanan ini. Jika kamu tidak menyetujuinya, mohon untuk
              tidak menggunakan layanan kami.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">2. Tentang Layanan</h2>
            <p>
              LEXORA adalah aplikasi belajar kosakata Bahasa Inggris berbasis
              gamifikasi. Layanan ini disediakan secara gratis dan tanpa iklan.
              Kami dapat menambah, mengubah, atau menghentikan fitur kapan saja
              demi peningkatan kualitas.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">3. Akun Kamu</h2>
            <p>
              Kamu bertanggung jawab menjaga kerahasiaan kata sandi akunmu dan atas
              semua aktivitas yang terjadi di dalamnya. Beri tahu kami segera jika
              kamu mencurigai adanya penggunaan tanpa izin. Kamu wajib memberikan
              informasi yang benar saat mendaftar.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">4. Penggunaan yang Dilarang</h2>
            <p>
              Kamu setuju untuk tidak menyalahgunakan layanan, termasuk mencoba
              mengakses sistem tanpa izin, mengganggu jalannya layanan, atau
              memanipulasi skor, XP, streak, maupun papan peringkat dengan cara
              yang tidak wajar.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">5. Konten &amp; Kekayaan Intelektual</h2>
            <p>
              Seluruh materi pembelajaran, desain, logo, dan maskot LEXORA adalah
              milik kami. Kamu tidak boleh menyalin atau mendistribusikannya tanpa
              izin tertulis.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">6. Batasan Tanggung Jawab</h2>
            <p>
              Layanan disediakan &ldquo;sebagaimana adanya&rdquo;. Kami berupaya
              menjaga layanan tetap berjalan baik, namun tidak menjamin bebas dari
              gangguan atau kesalahan. Kami tidak bertanggung jawab atas kerugian
              yang timbul dari penggunaan layanan.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">7. Perubahan Ketentuan</h2>
            <p>
              Kami dapat memperbarui Ketentuan Layanan ini sewaktu-waktu. Perubahan
              akan berlaku setelah dipublikasikan di halaman ini. Penggunaan layanan
              secara berkelanjutan berarti kamu menerima ketentuan yang diperbarui.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">8. Kontak</h2>
            <p>
              Ada pertanyaan seputar ketentuan ini? Lihat juga{' '}
              <Link href="/privacy" className="font-semibold text-brand-500 underline hover:text-brand-400">
                Kebijakan Privasi
              </Link>{' '}
              kami.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
