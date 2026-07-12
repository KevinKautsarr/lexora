'use client'

// Error boundary paling luar — hanya aktif kalau ROOT LAYOUT ikut gagal.
// Di titik ini globals.css & font tidak dijamin termuat, jadi semua gaya
// inline dan gambar pakai <img> biasa (bukan next/image).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          backgroundColor: '#1a231d',
          color: '#f4f4f5',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/12_confused_state.png"
          alt=""
          width={130}
          height={130}
          style={{ userSelect: 'none' }}
        />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
          Waduh, ada yang tidak beres
        </h1>
        <p style={{ margin: 0, maxWidth: 380, fontSize: 14, lineHeight: 1.6, color: '#a1a1aa' }}>
          Terjadi kesalahan pada aplikasi. Coba muat ulang — progres belajarmu
          aman tersimpan.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            minHeight: 44,
            padding: '10px 28px',
            borderRadius: 16,
            border: 'none',
            borderBottom: '4px solid #4d7c57',
            backgroundColor: '#6da776',
            color: '#fff',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Coba lagi
        </button>
        {error.digest && (
          <p style={{ marginTop: 8, fontSize: 10, fontFamily: 'monospace', color: '#52525b' }}>
            Kode error: {error.digest}
          </p>
        )}
      </body>
    </html>
  )
}
