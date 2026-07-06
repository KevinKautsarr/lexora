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

// App is dark-only: color-scheme fixes native scrollbars, inputs & autofill;
// theme-color matches bg-zinc-900 so mobile browser chrome blends in.
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#18181b",
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
