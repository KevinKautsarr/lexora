import { ImageResponse } from 'next/og'

// OG / social preview image — muncul saat link LEXORA dibagikan (WA, FB, dst).
// Dibuat dengan kode (ImageResponse) supaya konsisten dengan tema sage & tidak
// perlu aset PNG statis yang harus dijaga manual.

export const alt = 'LEXORA — Belajar kosakata bahasa Inggris dengan cara yang seru'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #edf1d6 0%, #dde8c8 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Lambang daun-buku */}
        <div
          style={{
            display: 'flex',
            width: 128,
            height: 128,
            borderRadius: 32,
            background: '#40513b',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 12C16 16 4 28 4 48c0 10 4 18 8 24 10-6 16-16 18-30 2-10 2-20 2-30Z"
              transform="scale(0.7) translate(14 8)"
              fill="#9dc08b"
            />
            <path
              d="M32 12c16 4 28 16 28 36 0 10-4 18-8 24-10-6-16-16-18-30-2-10-2-20-2-30Z"
              transform="scale(0.7) translate(14 8)"
              fill="#edf1d6"
            />
          </svg>
        </div>
        <div style={{ fontSize: 88, fontWeight: 800, color: '#40513b', letterSpacing: 2 }}>
          LEXORA
        </div>
        <div style={{ fontSize: 32, color: '#4f8258', marginTop: 12, fontWeight: 600 }}>
          Belajar kosakata bahasa Inggris dengan cara yang seru
        </div>
      </div>
    ),
    { ...size },
  )
}
