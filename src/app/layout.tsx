import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Väderskuggan",
    template: "%s | Väderskuggan",
  },
  description:
    "Väderskuggan — en modern och lättanvänd väderapp för Sverige. Snabb vy över aktuell temperatur, nederbörd och prognoser.",
  keywords: [
    "väder",
    "väderprognos",
    "SMHI",
    "Väderskuggan",
    "lokalt väder",
    "forecast",
    "Sverige",
  ],
  authors: [{ name: "Josefine Eriksson", url: "https://kodochdesign.se" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Väderskuggan",
    description:
      "Väderskuggan — snabb och tydlig väderinformation för din plats i Sverige.",
    url: "https://vaderskuggan.vercel.app/",
    siteName: "Väderskuggan",
    images: [
      {
        url: "/screenshot-desktop.png",
        width: 1200,
        height: 630,
        alt: "Väderskuggan — skärmbild",
      },
    ],
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Väderskuggan",
    description:
      "Väderskuggan — snabb och tydlig väderinformation för din plats i Sverige.",
    images: ["/screenshot-desktop.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
