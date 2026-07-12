// Harga & aturan item toko — dipakai halaman (display) dan server action
// (validasi). Satu sumber supaya UI tak pernah beda dengan logika beli.
//
// Kalibrasi: goal harian penuh ≈ 80 gems/hari (10+20+50). Freeze sengaja
// premium (4× booster ≈ 6 hari goal penuh) — sifatnya langka (drop gratis
// hanya 10%) dan melindungi aset paling berharga: streak. Booster murah
// agar jadi pembelian impulsif yang sehat.

export const FREEZE_PRICE = 480
export const MAX_FREEZES = 3

export const BOOSTER_PRICE = 120
export const BOOSTER_MULTIPLIER = 2.0
export const BOOSTER_DURATION_MINUTES = 30
