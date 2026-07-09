import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
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

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";

export const metadata: Metadata = {
  title: {
    default: "Sassy's Bakery — Thorndale, ON",
    template: "%s | Sassy's Bakery",
  },
  description:
    "Family-owned bakery, deli & pizzeria in Thorndale, Ontario. Fresh baked breads, pizza, deli meats, ice cream, and more.",
  keywords: ["bakery", "Thorndale", "Ontario", "pizza", "bread", "deli", "order online", "pickup", "wholesale"],
  metadataBase: new URL(BASE),
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "Sassy's Bakery",
    images: [
      {
        url: `/api/og?title=Sassy%27s+Bakery&subtitle=Thorndale%2C+Ontario`,
        width: 1200,
        height: 630,
        alt: "Sassy's Bakery — Thorndale, ON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
