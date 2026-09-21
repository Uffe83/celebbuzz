
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
  title: "CelebBuzz – Senaste nytt om film, TV, musik och kändisar",
  description:
    "CelebBuzz ger dig de senaste nyheterna inom film, TV, streaming, musik, kändisar och underhållning.",
  openGraph: {
    title: "CelebBuzz – Senaste nytt om film, TV, musik och kändisar",
    description:
      "CelebBuzz ger dig de senaste nyheterna inom film, TV, streaming, musik, kändisar och underhållning.",
    url: "https://celebbuzz-six.vercel.app",
    siteName: "CelebBuzz",
    locale: "sv_SE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}