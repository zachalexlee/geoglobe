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

export const metadata: Metadata = {
  title: "GeoGlobe — Daily Geography Game",
  description: "A daily geography game — explore history, one pin at a time.",
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
