import type { NextConfig } from "next";

// Security headers untuk semua route. CSP sengaja belum dipasang (script tema
// inline di layout butuh nonce/hash — effort besar, nilai marginal kecil
// selama tidak ada vector XSS); lapisan di bawah ini murah dan berdampak.
const securityHeaders = [
  // Larang halaman di-iframe situs lain — menutup clickjacking (mis. tombol
  // "Hapus akun" ditumpuk overlay transparan di situs jahat).
  { key: "X-Frame-Options", value: "DENY" },
  // Browser tidak boleh menebak MIME type — file upload/asset tak bisa
  // "menyamar" jadi script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Kirim origin saja saat pindah ke situs lain — token/path internal tidak
  // bocor lewat header Referer.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Matikan API browser yang tidak dipakai app ini.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // CSP mode Report-Only: memantau dan mengumpulkan pelanggaran di console browser tanpa memblokir.
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
] as const;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default nextConfig;
