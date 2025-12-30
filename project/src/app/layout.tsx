import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RefStats - Referee Statistics for Smart Bettors",
  description: "Comprehensive referee statistics and betting analytics for Premier League, La Liga, Serie A, Bundesliga, and Ligue 1.",
  keywords: ["referee statistics", "betting", "football", "soccer", "analytics", "Premier League", "La Liga"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
