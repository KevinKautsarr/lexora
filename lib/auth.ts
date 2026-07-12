import 'server-only'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from './prisma'
import { sendEmail } from './email'

// Nama user diisi bebas saat daftar — WAJIB di-escape sebelum masuk HTML
// email, kalau tidak email resmi Lexora bisa me-render markup titipan user.
function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// Template email — HTML sederhana yang aman untuk semua client email
// (tanpa CSS eksternal), nuansa sage Lexora.
function emailShell(greetingName: string | null | undefined, body: string): string {
  const greeting = greetingName ? `Halo ${escapeHtml(greetingName)},` : 'Halo,'
  return `
  <div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#27272a">
    <h1 style="font-size:20px;color:#40513B">LEXORA</h1>
    <p>${greeting}</p>
    ${body}
  </div>`
}

function emailButton(url: string, label: string): string {
  return `
    <p style="margin:28px 0">
      <a href="${url}"
         style="display:inline-block;background:#6da776;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:14px">
        ${label}
      </a>
    </p>`
}

function resetPasswordHtml(name: string | null | undefined, url: string): string {
  return emailShell(
    name,
    `<p>Kami menerima permintaan untuk mengganti password akun Lexora-mu.
    Klik tombol di bawah untuk membuat password baru. Tautan ini berlaku 1 jam.</p>
    ${emailButton(url, 'Buat Password Baru')}
    <p style="font-size:13px;color:#71717a">Kalau kamu tidak merasa meminta ini,
    abaikan saja email ini — password-mu tidak berubah.</p>`,
  )
}

function verifyEmailHtml(name: string | null | undefined, url: string): string {
  return emailShell(
    name,
    `<p>Satu langkah lagi! Klik tombol di bawah untuk memverifikasi email-mu
    dan mulai belajar di Lexora.</p>
    ${emailButton(url, 'Verifikasi Email')}
    <p style="font-size:13px;color:#71717a">Kalau kamu tidak merasa mendaftar
    di Lexora, abaikan saja email ini.</p>`,
  )
}

export const auth = betterAuth({
  // Di production WAJIB set BETTER_AUTH_URL ke URL publik aplikasi
  // (mis. https://lexora.vercel.app) — dipakai untuk origin check CSRF,
  // cookie, dan callback. Di dev cukup http://localhost:3000.
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    // Email harus diverifikasi sebelum bisa login — menutup pendaftaran
    // dengan email palsu DAN serangan pre-account-takeover (penyerang daftar
    // duluan pakai email korban; tanpa akses inbox, akun itu tak bisa dipakai).
    requireEmailVerification: true,
    // Alur lupa-password: Better Auth membuat token & URL verifikasi; kita
    // tinggal mengirimkannya. Token kedaluwarsa mengikuti default (1 jam).
    // Setelah reset sukses, semua sesi lama dicabut — kalau akun sempat
    // dibobol, sesi si pembobol ikut mati.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset password Lexora',
        html: resetPasswordHtml(user.name, url),
      })
    },
  },
  emailVerification: {
    // Kirim tautan verifikasi saat daftar, dan kirim ULANG otomatis tiap kali
    // user yang belum terverifikasi mencoba login (sendOnSignIn).
    sendOnSignUp: true,
    sendOnSignIn: true,
    // Setelah klik tautan, user langsung masuk — tanpa harus login manual lagi.
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verifikasi email Lexora-mu',
        html: verifyEmailHtml(user.name, url),
      })
    },
  },
  // Login Google — hanya terdaftar bila kredensialnya ada di env, supaya
  // app tetap jalan normal di lingkungan tanpa OAuth (mis. CI).
  // Redirect URI di Google Cloud Console: {BETTER_AUTH_URL}/api/auth/callback/google
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  session: {
    // Matikan cek "session freshness" (default 1 hari). Tanpa ini, endpoint
    // manajemen sesi (listSessions/revokeSessions) melempar SESSION_NOT_FRESH
    // untuk sesi lama. Aksi sensitif (hapus akun) sudah dilindungi konfirmasi
    // ketik-ulang email di sisi aplikasi, jadi freshness check tak diperlukan.
    freshAge: 0,
  },
  // nextCookies harus jadi plugin terakhir: menyalin Set-Cookie ke
  // cookie store Next saat auth API dipanggil dari server actions.
  plugins: [nextCookies()],
})
