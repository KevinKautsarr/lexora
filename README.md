This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy ke Vercel

1. **Push repo ini ke GitHub** (pastikan `.env` tidak ikut — sudah di-gitignore; `.env.example` yang jadi acuan).
2. Di [vercel.com](https://vercel.com) → **Add New Project** → import repo ini. Framework terdeteksi otomatis (Next.js); build command default `next build` sudah benar — `prisma generate` jalan otomatis lewat script `postinstall`.
3. Di **Settings → Environment Variables**, isi tiga variabel (lihat `.env.example`):
   - `DATABASE_URL` — connection string Neon (yang sama dengan lokal, atau branch produksi terpisah di Neon).
   - `BETTER_AUTH_SECRET` — string acak baru untuk produksi: `openssl rand -hex 32`. Jangan pakai secret dev.
   - `BETTER_AUTH_URL` — URL produksi, mis. `https://nama-app.vercel.app`. (Deploy pertama: biarkan dulu, lihat URL yang diberikan Vercel, isi variabel ini, lalu redeploy.)
4. **Deploy**, lalu uji di URL produksi: register akun baru → login → mainkan 1 lesson → cek XP/progress tersimpan.

Catatan:
- Migrasi database dijalankan dari mesin dev (`npx prisma migrate dev`) atau CI — build Vercel tidak memigrasi DB.
- Kalau register/login gagal dengan error origin/CSRF, hampir pasti `BETTER_AUTH_URL` belum cocok dengan domain yang diakses.
