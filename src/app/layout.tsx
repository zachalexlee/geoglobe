import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import NavBar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://geoglobe-production.up.railway.app";

export const metadata: Metadata = {
  title: "GeoGlobe — Daily Geography Game",
  description: "A daily geography game — explore history, one pin at a time.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "GeoGlobe — Daily Geography Game",
    description: "A daily geography game — explore history, one pin at a time.",
    url: siteUrl,
    siteName: "GeoGlobe",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GeoGlobe — Daily Geography Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoGlobe — Daily Geography Game",
    description: "A daily geography game — explore history, one pin at a time.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <Providers>
          <NavBar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
