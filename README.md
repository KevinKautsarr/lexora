# LEXORA 🇬🇧→🇮🇩

Aplikasi belajar kosakata bahasa Inggris bergaya Duolingo: journey path per unit, game mencocokkan kata melawan waktu, XP, level, streak harian, dan leaderboard.

**Live demo:** https://lexorapp.vercel.app

> _Screenshot menyusul — halaman Journey (dark theme, sidebar) dan game Match Madness._
<!-- ![Journey](docs/screenshot-journey.png) -->
<!-- ![Match Madness](docs/screenshot-game.png) -->

## Fitur Utama

- **Tingkatan CEFR (A1–C1)** — 5 tingkat × 3 unit × 3 lesson = 45 lesson / 360 kata, disusun mengacu penjenjangan CEFR. Konten seluruhnya dari `prisma/vocabulary-seed.json` (seed idempotent).
- **Onboarding + placement test** — user baru memilih tingkat awal. Pilih Pemula (A1) → langsung mulai; tingkat lain → tes penempatan 12 soal pilihan ganda yang **dibuat dan dinilai di server** (klien tidak pernah menerima kunci jawaban). Lulus ≥9/12 menempatkan user di tingkat itu; gagal memberi rekomendasi tingkat yang pas.
- **Journey path dengan unlock berlevel** — dikelompokkan per tingkat CEFR. Tingkat di bawah titik awal user terbuka bebas untuk review; tingkat aktif berantai (lesson berikutnya terbuka setelah sebelumnya selesai). Ditegakkan tiga lapis: UI, guard halaman, dan validasi server.
- **Match Madness** — game mencocokkan kata Indonesia (kiri) ↔ Inggris (kanan) dalam 60 detik. Skor **dihitung di server**: klien hanya mengirim jumlah benar + percobaan, divalidasi terhadap isi lesson di database — skor tidak bisa dipalsukan dari client.
- **Progresi pemain** — dua metrik berbeda: **Tingkat** (CEFR, kemampuan bahasa) dan **Level** (dari XP, 500 XP/level). Plus streak harian (basis hari UTC), streak terpanjang, dan daily goals (1 lesson + 50 XP per hari).
- **Practice mode** — review acak dari kosakata lesson yang sudah diselesaikan, tanpa memengaruhi XP.
- **Leaderboard** — peringkat XP semua pengguna, top-3 diberi badge, posisi sendiri selalu terlihat.
- **Autentikasi** — email + password via Better Auth (session di database, ganti password perlu password lama, semua server action memvalidasi session).

### Sistem Tingkatan CEFR & Placement Test

Ada **dua konsep berbeda** yang sengaja dibedakan agar tidak rancu:

| | **Tingkat** (CEFR) | **Level** (XP) |
|---|---|---|
| Arti | Kemampuan bahasa: A1 Pemula → C1 Mahir | Progres bermain: `floor(xp/500)+1` |
| Berubah saat | Menyelesaikan lesson di tingkat lebih tinggi | Mengumpulkan XP |
| Ditampilkan | "Tingkat: Menengah (B1)" | "Level 4" |

**Placement test** (anti-curang):
- Soal disampel di server (8 kata tingkat target + 4 tingkat di bawahnya), dikirim ke klien **tanpa penanda jawaban benar** — hanya prompt Indonesia + 4 opsi Inggris acak.
- Penilaian membandingkan jawaban terhadap kunci yang diambil ulang dari database via `questionWordIds` — memanipulasi jawaban lewat request langsung tetap dinilai apa adanya oleh server.
- Sesi tidak bisa di-submit dua kali; `startPlacement` berulang memakai sesi yang sama (anti re-roll soal).
- Alasan pilihan ganda (bukan matching): matching memberi petunjuk silang sehingga menilai kemampuan terlalu tinggi; per-soal pilihan ganda lebih akurat sebagai alat ukur.

## Tech Stack & Arsitektur

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js (App Router, Turbopack) + TypeScript |
| Database | PostgreSQL serverless (Neon) via Prisma 7 + `@prisma/adapter-neon` |
| Auth | Better Auth (Prisma adapter, session-based) |
| UI | Tailwind CSS v4, lucide-react, dark theme |
| Testing | Vitest (unit test logika murni) |

Pola arsitektur yang dipakai:

- **Server Components** untuk semua fetching data (tidak ada API route untuk read) — halaman meng-query Prisma langsung di server.
- **Server Actions** untuk mutasi (`submitScore`, `updateName`) — setiap action memvalidasi session dan input di server, lalu `revalidatePath` menyegarkan UI dalam satu roundtrip.
- **Logika murni terisolasi** di `lib/` (`progress.ts` unlock, `level.ts`, `streak.ts`, `scoring.ts`) — gampang di-unit-test dan dipakai bersama oleh halaman + validasi server.
- **Anti-cheat**: perhitungan skor, cek unlock, dan streak semuanya server-side dalam satu transaksi Prisma.

## Menjalankan Secara Lokal

```bash
git clone https://github.com/KevinKautsarr/lexora.git
cd lexora
npm install                     # prisma generate otomatis via postinstall

cp .env.example .env            # lalu isi nilainya (lihat komentar di dalamnya)

npx prisma migrate dev          # buat tabel
npx prisma db seed              # isi 5 tingkat CEFR / 45 lesson / 360 kata dari JSON

npm run dev                     # http://localhost:3000
```

Perintah lain: `npm test` (unit test), `npm run build` (build produksi), `npx prisma studio` (GUI database).

**Akun demo:** daftar akun baru langsung dari halaman register — kamu akan melewati onboarding pemilihan tingkat (pilih Pemula untuk mulai cepat, atau tingkat lain untuk mencoba placement test).

## Deploy ke Vercel

1. Push repo ke GitHub (`.env` ter-gitignore; `.env.example` jadi acuan).
2. Import repo di Vercel — preset Next.js default sudah benar, `prisma generate` jalan otomatis via `postinstall`.
3. Isi environment variables: `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET` (baru, `openssl rand -hex 32`), `BETTER_AUTH_URL` (URL produksi, mis. `https://lexorapp.vercel.app`).
4. Deploy, lalu uji register/login di URL produksi.

Catatan: migrasi database dijalankan dari mesin dev (`npx prisma migrate dev`), bukan oleh build Vercel. Error origin/CSRF saat login hampir pasti berarti `BETTER_AUTH_URL` tidak cocok dengan domain.

## Laravel vs Next.js — Catatan Perbandingan

_Draft perbandingan membangun aplikasi serupa di dua stack (akan dilengkapi dengan pengalaman pribadi):_

| Konsep | Laravel | Next.js (proyek ini) |
|---|---|---|
| Templating | Blade — HTML dirender server, interaktivitas butuh Alpine/Livewire | React Server + Client Components — satu bahasa untuk render server dan interaksi client |
| Endpoint mutasi | Controller + Route + FormRequest | Server Action — fungsi yang dipanggil langsung dari komponen, tanpa mendefinisikan route |
| ORM | Eloquent (Active Record: `$user->save()`) | Prisma (client ter-generate dari schema, fully typed: `prisma.user.update()`) |
| Proteksi halaman | Middleware `auth` di route group | Cek session di tiap server component (`getSessionUser()` + `redirect`) |
| Validasi | FormRequest / `$request->validate()` | Manual di awal server action (tipe + rentang + kepemilikan) |
| Migrasi | `php artisan migrate` | `npx prisma migrate dev` |
| Auth bawaan | Breeze/Jetstream/Fortify | Pilih library — di sini Better Auth (schema di-generate ke Prisma) |

Perbedaan paling terasa: di Laravel batas request/response selalu eksplisit (route → controller → view), sedangkan di Next.js batas server/client ada **di dalam pohon komponen** — mudah membuat data fetching kolokasi dengan UI, tapi menuntut disiplin soal apa yang boleh bocor ke client.

---

Dibangun sebagai proyek pembelajaran full-stack. Ide lanjutan: leaderboard mingguan (league), streak per-timezone, verifikasi email, CMS kosakata, tipe soal baru (pilihan ganda, listening), dan achievement.
