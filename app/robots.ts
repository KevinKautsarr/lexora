import type { MetadataRoute } from 'next'

const BASE_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

// Halaman ber-login tidak berguna bagi crawler (isinya redirect ke /login)
// dan tidak boleh terindeks. Hanya halaman publik yang boleh dirayapi.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/register', '/privacy', '/terms'],
      disallow: [
        '/api/',
        '/learn',
        '/game',
        '/goals',
        '/streak',
        '/leaderboard',
        '/profile',
        '/settings',
        '/shop',
        '/dictionary',
        '/onboarding',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
