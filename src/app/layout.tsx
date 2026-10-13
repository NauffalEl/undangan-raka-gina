import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://undangan-raka-gina.vercel.app"),
  title: "Raka & Gina",
  description: "Undangan pernikahan Raka & Gina — 20 Desember 2026",
  openGraph: {
    title: "Raka & Gina — 20.12.2026",
    description: "Kami mengundang Bapak/Ibu/Saudara/i hadir di hari bahagia kami.",
    type: "website",
    images: [
      {
        url: "/foto/hero.svg",
        width: 1200,
        height: 630,
        alt: "Raka & Gina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raka & Gina — 20.12.2026",
    description: "Kami mengundang Bapak/Ibu/Saudara/i hadir di hari bahagia kami.",
    images: ["/foto/hero.svg"],
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF7F0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${cormorant.variable} ${jakarta.variable} h-full`}>
      <head>
        {/* Tandai JS aktif agar .reveal-hidden boleh menyembunyikan konten */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="bg-fx" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}