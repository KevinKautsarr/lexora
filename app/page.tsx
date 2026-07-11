import Link from 'next/link'
import { getSessionUser } from '@/lib/session'
import Mascot from '@/components/Mascot'
import LandingNavbar from '@/components/landing/LandingNavbar'
import MatchSimulation from '@/components/landing/MatchSimulation'
import StreakCalendarMock from '@/components/landing/StreakCalendarMock'
import MobilePathMock from '@/components/landing/MobilePathMock'
import LeaderboardMock from '@/components/landing/LeaderboardMock'
import AchievementMock from '@/components/landing/AchievementMock'
import LandingFaq from '@/components/landing/LandingFaq'
import { totalAchievementCount } from '@/lib/achievements'

import {
  BookOpen,
  Flame,
  Trophy,
  Smartphone,
  Medal,
  Zap,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export default async function Home() {
  const sessionUser = await getSessionUser()
  const isLoggedIn = !!sessionUser
  const totalBadges = totalAchievementCount()

  // Levels & Topics supported by Lexora (CEFR scale matching DB seed)
  const topics = [
    { name: 'A1 Pemula (Salam, Keluarga, Rumah)', icon: '🌱' },
    { name: 'A2 Dasar (Hobi, Transportasi, Belanja)', icon: '🚲' },
    { name: 'B1 Menengah (Kerja, Teknologi, Lingkungan)', icon: '💼' },
    { name: 'B2 Menengah Atas (Ekonomi, Bisnis, Pikiran)', icon: '🔬' },
    { name: 'C1 Mahir (Akademik, Idiom, Politik)', icon: '🎓' },
  ]

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col selection:bg-brand-300 selection:text-brand-900">
      {/* Header / Navbar */}
      <LandingNavbar isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <header className="relative overflow-hidden py-16 md:py-24 border-b border-zinc-700/40">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#b6c3a6_1px,transparent_1px),linear-gradient(to_bottom,#b6c3a6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.18]"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Mascot left column */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="relative group pointer-events-none">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-300 to-brand-500 opacity-20 blur-xl transition duration-1000 group-hover:opacity-30 group-hover:duration-200"></div>
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-zinc-800/40 border border-zinc-700/60 shadow-inner p-4 backdrop-blur-sm overflow-visible">
                  <Mascot pose="greeting" size={500} className="transform hover:scale-105 transition-transform duration-300" />
                </div>

                {/* Floating speech bubble for Hero Mascot */}
                <div className="absolute -top-15 -right-4 z-20 bg-zinc-800/70 rounded-2xl px-3.5 py-2 text-[11px] font-black text-zinc-100 shadow-lg max-w-[150px] text-pretty animate-bounce-slow backdrop-blur-sm">
                  Hi! Aku Lexi, yuk mulai belajarmu! 🦖
                  <div className="absolute left-8 bottom-[-5px] h-2.5 w-2.5 rotate-45 bg-zinc-800/70"></div>
                </div>
              </div>
            </div>

            {/* Content right column */}
            <div className="lg:col-span-7 text-center lg:text-left order-1 lg:order-2 flex flex-col justify-center items-center lg:items-start">
              {/* Promo Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3.5 py-1.5 text-xs font-black text-brand-600 border border-brand-500/20 mb-6">
                <Zap size={14} className="fill-brand-600 text-brand-600" />
                <span>100% GRATIS & TANPA IKLAN</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl leading-[1.1] max-w-2xl">
                Cara gratis, seru, dan efektif untuk belajar kosakata Bahasa Inggris!
              </h1>
              
              <p className="mt-6 text-base md:text-lg text-zinc-300 max-w-xl leading-relaxed">
                Tingkatkan perbendaharaan kata kamu lewat metode terstruktur, gamifikasi menyenangkan, dan latihan praktis yang membuat belajar menjadi kebiasaan harian.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link
                  href={isLoggedIn ? '/learn' : '/register'}
                  className="w-full sm:w-auto text-center rounded-2xl bg-brand-600 px-8 py-4 text-base font-black text-white hover:bg-brand-500 hover:scale-[1.02] active:scale-98 transition-all shadow-lg shadow-brand-900/10 cursor-pointer"
                >
                  {isLoggedIn ? 'MASUK KE DASHBOARD' : 'MULAI BELAJAR SEKARANG'}
                </Link>

                {!isLoggedIn && (
                  <Link
                    href="/login"
                    className="w-full sm:w-auto text-center rounded-2xl border-2 border-zinc-700 bg-zinc-800/40 px-8 py-3.5 text-base font-black text-zinc-100 hover:bg-zinc-800 hover:border-zinc-500 transition-all cursor-pointer"
                  >
                    SAYA SUDAH PUNYA AKUN
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Banner — Marquee Ticker */}
      <section className="bg-zinc-800/50 py-6 border-b border-zinc-700/30 overflow-hidden">
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            animation: marquee 28s linear infinite;
            will-change: transform;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        <p className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">
          JELAJAHI TINGKATAN KOSAKATA (CEFR)
        </p>

        {/* Fade mask kiri-kanan */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-zinc-800/50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-zinc-800/50 to-transparent" />

          <div className="flex overflow-hidden">
            <div className="marquee-track flex shrink-0 gap-3.5 px-2">
              {/* Set asli */}
              {topics.map((topic, i) => (
                <div
                  key={`a-${i}`}
                  className="flex shrink-0 items-center gap-2 rounded-2xl border border-zinc-700/60 bg-zinc-900/40 px-4 py-2.5 text-sm font-bold text-zinc-200 whitespace-nowrap hover:bg-zinc-800 hover:border-brand-500 transition-colors cursor-default"
                >
                  <span>{topic.icon}</span>
                  <span>{topic.name}</span>
                </div>
              ))}
              {/* Duplikat untuk seamless loop */}
              {topics.map((topic, i) => (
                <div
                  key={`b-${i}`}
                  className="flex shrink-0 items-center gap-2 rounded-2xl border border-zinc-700/60 bg-zinc-900/40 px-4 py-2.5 text-sm font-bold text-zinc-200 whitespace-nowrap hover:bg-zinc-800 hover:border-brand-500 transition-colors cursor-default"
                >
                  <span>{topic.icon}</span>
                  <span>{topic.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <main id="fitur" className="flex-grow py-16 md:py-24 space-y-24 md:space-y-32">
        
        {/* Feature 1: Match Madness (Learn by Doing) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Content left */}
            <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-5">
                <BookOpen size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl leading-tight">
                Belajar Aktif dengan Mode Cocok Kata
              </h2>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-zinc-300 max-w-lg">
                Menghafal kosakata secara pasif sangat membosankan dan cepat lupa. Latih kecepatan berpikir kamu dengan mencocokkan kata Bahasa Inggris dan artinya secara cepat di bawah tekanan waktu!
              </p>
              
              <ul className="mt-6 space-y-3 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Sistem pencocokan interaktif yang seru</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Meningkatkan daya ingat memori jangka panjang</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Dapatkan bonus XP setelah berhasil menyelesaikan tantangan</span>
                </li>
              </ul>

              {/* Mascot Companion speech bubble */}
              <div className="mt-8 flex items-center gap-4 max-w-md w-full">
                <Mascot pose="wave" size={60} className="shrink-0" />
                <div className="relative bg-zinc-800/50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-300 shadow-lg">
                  <div className="absolute left-[-6px] top-6 h-3 w-3 rotate-45 bg-zinc-800/50"></div>
                  Ayo coba klik kartu di sebelah kanan untuk latihan mencocokkan kata secara langsung!
                </div>
              </div>
            </div>

            {/* Widget Right */}
            <div className="lg:col-span-6 flex justify-center">
              <MatchSimulation />
            </div>
          </div>
        </section>

        {/* Feature 2: Streak (Consistency) */}
        <section id="metodologi" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Widget Left */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <StreakCalendarMock />
            </div>

            {/* Content right */}
            <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left items-center lg:items-start order-1 lg:order-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-5">
                <Flame size={24} className="fill-orange-500/20" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl leading-tight">
                Bangun Kebiasaan Belajar Harianmu
              </h2>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-zinc-300 max-w-lg">
                Setiap hari kamu menyelesaikan minimal satu pelajaran, kamu akan menjaga api streak harian tetap menyala. Sistem streak memotivasimu untuk tetap konsisten, sehingga hasil belajar lebih maksimal.
              </p>

              <ul className="mt-6 space-y-3 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Kalender streak interaktif harian</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Pengingat visual yang interaktif untuk belajar</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Membangun konsistensi pembentukan kebiasaan baru</span>
                </li>
              </ul>

              {/* Mascot Companion speech bubble */}
              <div className="mt-8 flex items-center gap-4 max-w-md w-full">
                <Mascot pose="streak-keeper" size={60} className="shrink-0" />
                <div className="relative bg-zinc-800/50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-300 shadow-lg">
                  <div className="absolute left-[-6px] top-6 h-3 w-3 rotate-45 bg-zinc-800/50"></div>
                  Jaga nyala api streak kita setiap hari agar belajarmu makin konsisten! 🔥
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Smartphone (Code Anywhere) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Content left */}
            <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-5">
                <Smartphone size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl leading-tight">
                Belajar di Mana Saja, Kapan Saja
              </h2>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-zinc-300 max-w-lg">
                Tidak ada batasan perangkat. Baik kamu menggunakan laptop di meja kerja, tablet di ruang tamu, maupun smartphone saat berada di transportasi umum, Lexora selalu memberikan pengalaman belajar yang mulus.
              </p>

              <ul className="mt-6 space-y-3 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Desain responsif penuh menyesuaikan layarmu</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Pemuatan data yang cepat dan efisien</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Navigasi perjalanan pelajaran yang intuitif</span>
                </li>
              </ul>

              {/* Mascot Companion speech bubble */}
              <div className="mt-8 flex items-center gap-4 max-w-md w-full">
                <Mascot pose="flexible" size={60} className="shrink-0" />
                <div className="relative bg-zinc-800/50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-300 shadow-lg">
                  <div className="absolute left-[-6px] top-6 h-3 w-3 rotate-45 bg-zinc-800/50"></div>
                  Aku akan setia menemanimu belajar lewat HP, tablet, maupun laptop kapan pun kamu mau! 📱
                </div>
              </div>
            </div>

            {/* Widget Right */}
            <div className="lg:col-span-6 flex justify-center">
              <MobilePathMock />
            </div>
          </div>
        </section>

        {/* Feature 4: Achievement System (Prove progress) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Widget Left */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <AchievementMock totalBadges={totalBadges} />
            </div>

            {/* Content right */}
            <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left items-center lg:items-start order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Medal size={24} />
                </div>
                <span className="rounded-lg bg-zinc-800 border border-zinc-700/80 px-2.5 py-1 text-[9px] font-black text-amber-500 tracking-wider">SISTEM PENCAPAIAN</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl leading-tight">
                {totalBadges} Badge Menantimu
              </h2>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-zinc-300 max-w-lg">
                Setiap streak, lesson, XP, gems, dan kemenangan liga yang kamu kumpulkan otomatis terekam jadi pencapaian. Lihat progresmu kapan saja di halaman profil — tanpa perlu menunggu apa pun.
              </p>

              <ul className="mt-6 space-y-3 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>7 kategori: Streak, Lesson, XP, Gems, Liga, Level CEFR & lainnya</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Progres tiap badge terlihat jelas — tahu persis seberapa dekat kamu</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Terekam otomatis dari aktivitas belajar nyata, tanpa klaim manual</span>
                </li>
              </ul>

              {/* Mascot Companion speech bubble */}
              <div className="mt-8 flex items-center gap-4 max-w-md w-full">
                <Mascot pose="trophy" size={60} className="shrink-0" />
                <div className="relative bg-zinc-800/50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-300 shadow-lg">
                  <div className="absolute left-[-6px] top-6 h-3 w-3 rotate-45 bg-zinc-800/50"></div>
                  Makin rajin belajar, makin banyak badge yang kamu buka! 🏅
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 5: Leaderboard (You're not alone) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Content left */}
            <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  <Trophy size={24} className="fill-yellow-500/10" />
                </div>
                <span className="rounded-lg bg-zinc-800 border border-zinc-700/80 px-2.5 py-1 text-[9px] font-black text-yellow-500 tracking-wider">LIGA MINGGUAN</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl leading-tight">
                Papan Peringkat Global
              </h2>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-zinc-300 max-w-lg">
                Kumpulkan XP dari setiap pelajaran yang kamu selesaikan dan lihat posisimu di papan peringkat global. Bersaing di divisi Perunggu, Perak, dan Emas — naik divisi tiap minggu kalau kamu masuk 3 besar!
              </p>

              <ul className="mt-6 space-y-3 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Bandingkan pencapaianmu dengan pembelajar lain secara sehat</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Lacak total perolehan XP belajarmu secara realtime</span>
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm font-bold text-zinc-200">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                  <span>Sistem kompetisi liga & divisi mingguan — promosi otomatis tiap minggu</span>
                </li>
              </ul>

              {/* Mascot Companion speech bubble */}
              <div className="mt-8 flex items-center gap-4 max-w-md w-full">
                <Mascot pose="medal" size={60} className="shrink-0" />
                <div className="relative bg-zinc-800/50 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-300 shadow-lg">
                  <div className="absolute left-[-6px] top-6 h-3 w-3 rotate-45 bg-zinc-800/50"></div>
                  Kumpulkan XP sebanyak-banyaknya dari setiap pelajaran dan mari rebut posisi puncak papan skor! 🏆
                </div>
              </div>
            </div>

            {/* Widget Right */}
            <div className="lg:col-span-6 flex justify-center">
              <LeaderboardMock />
            </div>
          </div>
        </section>
      </main>

      {/* FAQ Section */}
      <section id="faq" className="bg-zinc-800/20 py-20 border-t border-b border-zinc-700/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <Mascot pose="thinking" size={90} className="mb-3 animate-bounce-slow" />
            <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-4 text-xs md:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Punya pertanyaan seputar Lexora? Kami merangkum beberapa jawaban terbaik untuk menjawab rasa penasaranmu.
            </p>
          </div>
          <LandingFaq />
        </div>
      </section>

      {/* Footer CTA Section / Mascot Peek-a-boo */}
      <section className="relative overflow-hidden pt-24 pb-16 bg-zinc-950 border-t border-zinc-800">
        {/* Curved / Wave Background */}
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-brand-900/10 pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-5xl leading-tight">
            Mulai Kuasai Bahasa Inggris Bersama Lexora
          </h2>
          <p className="mt-4 text-sm md:text-base text-zinc-400 max-w-lg leading-relaxed">
            Mulai belajarmu sekarang dengan cara yang seru, terstruktur, dan sepenuhnya gratis. Tanpa ada biaya tersembunyi.
          </p>

          <div className="mt-8 flex justify-center w-full sm:w-auto">
            <Link
              href={isLoggedIn ? '/learn' : '/register'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-10 py-5.5 text-base font-black text-white hover:bg-brand-500 hover:scale-[1.03] active:scale-98 transition-all shadow-xl shadow-brand-950/20 cursor-pointer"
            >
              MULAI BELAJAR - GRATIS
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Lexi Mascot peeking from bottom, surrounded by floating items */}
          <div className="relative mt-16 flex justify-center h-28 w-full max-w-md">
            {/* Peeking Mascot */}
            <div className="absolute bottom-0 z-10 translate-y-2">
              <Mascot pose="footer-cta-1" size={135} />
            </div>

            {/* Floating Assets around Mascot */}
            {/* Left float: key */}
            <div className="absolute left-1/4 top-1/4 -translate-y-4 -translate-x-2 animate-bounce-slow text-yellow-500 drop-shadow-md">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v3h3v-3h3v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </div>
            {/* Right float: treasure chest */}
            <div className="absolute right-1/4 top-1/4 -translate-y-2 translate-x-4 animate-bounce-slower text-orange-400 drop-shadow-md">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6H4V4h16v2zm-2 3H6v8h12V9zm2-2H4v11c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7z"/>
              </svg>
            </div>
          </div>
        </div>


      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-900 pb-8 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-zinc-300">LEXORA</span>
              <span className="text-[10px] font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                v1.0.0
              </span>
            </div>
            <div className="flex gap-6 text-xs font-semibold text-zinc-400">
              <a href="#fitur" className="hover:text-brand-500">Fitur</a>
              <a href="#metodologi" className="hover:text-brand-500">Metodologi</a>
              <a href="#faq" className="hover:text-brand-500">FAQ</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>&copy; {new Date().getFullYear()} Lexora. Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold">
              <ShieldCheck size={14} className="text-brand-500" />
              <span>Sistem Belajar Terenkripsi & Aman</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
