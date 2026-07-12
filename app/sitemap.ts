import type { MetadataRoute } from 'next'

const BASE_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

// Hanya halaman publik — halaman ber-login diblokir di robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/register`, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${BASE_URL}/login`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
