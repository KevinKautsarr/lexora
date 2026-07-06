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
  title: "LEXORA",
  description: "Belajar kosakata bahasa Inggris dengan cara yang seru",
};

// App is light (sage/earth theme): color-scheme fixes native scrollbars,
// inputs & autofill; theme-color matches the cream surface (#EDF1D6).
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#edf1d6",
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
