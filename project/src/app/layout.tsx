import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";
import Providers from "@/components/Providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "RefStats - Referee Statistics for Smart Bettors",
    template: "%s | RefStats",
  },
  description: "Comprehensive referee statistics and betting analytics for Premier League, La Liga, Serie A, Bundesliga, and Ligue 1. Track cards, penalties, and referee tendencies.",
  keywords: ["referee statistics", "betting", "football", "soccer", "analytics", "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "yellow cards", "red cards", "betting tips"],
  authors: [{ name: "RefStats" }],
  creator: "RefStats",
  publisher: "RefStats",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RefStats",
    title: "RefStats - Referee Statistics for Smart Bettors",
    description: "Comprehensive referee statistics and betting analytics for Europe's top 5 leagues.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RefStats - Referee Statistics for Smart Bettors",
    description: "Comprehensive referee statistics and betting analytics for Europe's top 5 leagues.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <SkipLink />
          <Navigation />
          <main
            id="main-content"
            className="flex-1"
            tabIndex={-1}
            role="main"
          >
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
