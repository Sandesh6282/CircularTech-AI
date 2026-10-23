import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CircularTech AI — Give Every Device a Second Life",
  description:
    "AI-powered decision-support application for electronic waste (e-waste). Evaluate reuse, repair, refurbishment, resale, or authorized recycling with transparent, explainable recommendations.",
  keywords: [
    "e-waste",
    "circular economy",
    "electronics repair",
    "electronic waste recycling",
    "device assessment",
    "AI decision engine",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
