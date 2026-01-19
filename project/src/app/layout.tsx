import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";

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
  metadataBase: new URL("https://reftrends.com"),
  title: {
    default: "RefTrends - Referee Statistics & Betting Analytics",
    template: "%s | RefTrends",
  },
  description: "Comprehensive referee statistics and betting analytics for Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Liga Portugal, and Super Lig. Track cards, penalties, and referee tendencies.",
  keywords: ["referee statistics", "betting", "football", "soccer", "analytics", "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "yellow cards", "red cards", "betting tips"],
  authors: [{ name: "RefTrends" }],
  creator: "RefTrends",
  publisher: "RefTrends",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RefTrends",
    title: "RefTrends - Referee Statistics & Betting Analytics",
    description: "Comprehensive referee statistics and betting analytics for Europe's top leagues.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RefTrends - Referee Statistics & Betting Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RefTrends - Referee Statistics & Betting Analytics",
    description: "Comprehensive referee statistics and betting analytics for Europe's top leagues.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
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
      </body>
    </html>
  );
}
