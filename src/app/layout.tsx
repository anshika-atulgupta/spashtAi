import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import SpaceBackgroundClient from "@/components/ui/SpaceBackgroundClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpashtAI | Insurance Finally Clear",
  description: "SpashtAI uses AI to simplify your policy, reveal hidden risks, and show exactly what you pay.",
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
      <body className="min-h-full flex flex-col">
        {/* 3-D galaxy background — sits fixed behind everything */}
        <SpaceBackgroundClient />

        <Navbar />
        <main className="flex-1 pt-16 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
