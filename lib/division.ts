// Daftar putih division yang valid -- konsisten dengan skema Prisma
// (kolom division String @default("BRONZE")).
// Fungsi murni tanpa Prisma/DB supaya bisa diuji dengan Vitest langsung.

export const VALID_DIVISIONS = new Set(['BRONZE', 'SILVER', 'GOLD'] as const)
export type Division = 'BRONZE' | 'SILVER' | 'GOLD'

/**
 * Validasi dan normalisasi nilai division dari input client.
 * Nilai tidak valid (termasuk injection, typo, dll.) dikembalikan sebagai `fallback`.
 *
 * @param raw   - Nilai mentah dari searchParams atau field lain (boleh undefined).
 * @param fallback - Division default jika `raw` tidak valid.
 */
export function parseDivision(raw: string | undefined | null, fallback: Division): Division {
  const upper = raw?.toUpperCase()
  return VALID_DIVISIONS.has(upper as Division) ? (upper as Division) : fallback
}

