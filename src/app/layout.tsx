import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sassy's Bakery — Thorndale, ON",
    template: "%s | Sassy's Bakery",
  },
  description:
    "Family-owned bakery, deli & pizzeria in Thorndale, Ontario. Fresh baked breads, pizza, deli meats, ice cream, and more.",
  keywords: ["bakery", "Thorndale", "Ontario", "pizza", "bread", "deli"],
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "Sassy's Bakery",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
