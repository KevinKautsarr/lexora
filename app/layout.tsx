import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // metadataBase dibaca dari env di produksi (Vercel URL); fallback ke localhost
  // untuk dev. Dipakai untuk membuat URL absolut OG image.
  metadataBase: new URL(
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "LEXORA — Belajar Kosakata Bahasa Inggris",
    template: "%s · LEXORA",
  },
  description: "Belajar kosakata bahasa Inggris dengan cara yang seru",
  applicationName: "LEXORA",
  icons: {
    icon: [
      { url: "/favicon.ico",    sizes: "any",          rel: "shortcut icon" },
      { url: "/favicon-16.png", sizes: "16x16",   type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32",   type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64",   type: "image/png" },
      { url: "/favicon-192.png",sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png",sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "LEXORA",
    description: "Belajar kosakata bahasa Inggris dengan cara yang seru",
    siteName: "LEXORA",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/favicon-filled-512.png", width: 512, height: 512, alt: "LEXORA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LEXORA",
    description: "Belajar kosakata bahasa Inggris dengan cara yang seru",
    images: ["/favicon-filled-512.png"],
  },
};

// themeColor matches the dark zinc surface used across the app.
export const viewport: Viewport = {
  themeColor: "#1c1c1e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-900 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
