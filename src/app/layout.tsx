import type { Metadata } from "next";
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
  title: "Your Real Wage — what your job actually pays you",
  description:
    "You think you make $X/hr. After commute, unpaid overtime, and the money your job quietly costs you, you actually make $Y/hr. Find your real wage. All math runs in your browser — nothing is sent anywhere.",
  openGraph: {
    title: "Your Real Wage",
    description:
      "You think you make $X/hr. You actually make $Y/hr. Find your real hourly wage.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Real Wage",
    description: "You think you make $X/hr. You actually make $Y/hr.",
  },
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
