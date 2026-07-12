import 'server-only'

// Pengirim email via Resend API — pakai fetch langsung, tanpa SDK (satu
// endpoint saja tidak butuh dependensi). Tanpa RESEND_API_KEY fungsi ini
// melempar error yang jelas; pemanggil (Better Auth) menampilkan kegagalan
// generik ke user tanpa membocorkan detail infrastruktur.
//
// Untuk testing tanpa domain sendiri: EMAIL_FROM default memakai
// onboarding@resend.dev — Resend hanya mengizinkannya mengirim ke alamat
// email pemilik akun Resend. Untuk produksi, verifikasi domain di Resend
// lalu set EMAIL_FROM="Lexora <noreply@domainmu.com>".

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Lexora <onboarding@resend.dev>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY belum diset — email tidak bisa dikirim')
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // || (bukan ??): EMAIL_FROM="" di .env harus jatuh ke default juga.
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend gagal (${res.status}): ${detail.slice(0, 200)}`)
  }
}
