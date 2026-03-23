import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif_Gujarati } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const gujarati = Noto_Serif_Gujarati({
  subsets: ["gujarati"],
  variable: "--font-gujarati",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Current Affairs in Gujarati 2026 | Best Daily Quiz, MCQs & Questions | CurrentAdda",
    template: "%s | CurrentAdda - કરંટ અફેર્સ ગુજરાતી 2026"
  },
  description: "Best Current Affairs in Gujarati 2026 (કરંટ અફેર્સ ગુજરાતી). Daily Current Affairs Questions and Answers in Gujarati for GSSSB CCE (7338 Posts), GPSC, PSI, Constable & Talati. 10,000+ Free MCQs, Daily Quiz, Live Leaderboard. Updated daily!",
  keywords: [
    "current affairs in gujarati",
    "current affairs 2026 gujarati",
    "current affairs 2026 in gujarati",
    "daily current affairs gujarati",
    "best current affairs in gujarati",
    "current affairs in gujarati 2026",
    "current affairs gujarati",
    "current affairs mcq in gujarati",
    "current affairs 2026 questions and answers in gujarati",
    "current affairs 2026 questions and answers",
    "current affairs january 2026 in gujarati",
    "cce current affairs",
    "current affairs for gpsc",
    "current affairs indiabix",
    "adda daily quiz",
    "current affairs today in gujarati",
    "current affairs today gujarati",
    "current affairs in gujarati language",
    "current affairs in gujarati pdf 2026",
    "current affairs 2026 pdf in gujarati",
    "current affairs 2026 question",
    "current affairs mcq 2026",
    "કરંટ અફેર્સ ગુજરાતી",
    "કરંટ અફેર્સ ૨૦૨૬ ગુજરાતી",
    "GPSC Current Affairs in Gujarati",
    "GSSSB Current Affairs Gujarati",
    "GSSSB CCE 2026",
    "Daily Current Affairs Gujarati 2026",
    "Current Affairs Quiz Gujarati",
    "Current Affairs MCQ Gujarati",
    "Monthly Current Affairs Gujarati",
    "CCE Current Affairs Gujarati",
    "CCE 2026 Current Affairs",
    "PSI Current Affairs Gujarati",
    "Talati Exam Preparation Gujarati",
    "Constable Exam Current Affairs",
    "Bin Sachivalay Current Affairs"
  ],
  authors: [{ name: "Ajay Ambaliya", url: "https://currentadda.vercel.app/author" }],
  creator: "CurrentAdda",
  publisher: "CurrentAdda",
  verification: {
    google: "kHbcgTTMqlyXfzurhxfvgm7Zw8ozz40__nRJlegsiBc",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://currentadda.vercel.app'),
  alternates: {
    languages: {
      'gu-IN': '/',
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/newlogo.png",
    shortcut: "/newlogo.png",
    apple: "/newlogo.png",
  },
  openGraph: {
    title: "Best Current Affairs in Gujarati 2026 | Daily Quiz & MCQs | CurrentAdda",
    description: "Best Daily Current Affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી 2026) — Questions & Answers for GSSSB CCE, GPSC, PSI, Constable & Talati. 10,000+ free MCQs. Updated daily!",
    url: "https://currentadda.vercel.app",
    siteName: "CurrentAdda",
    images: [
      {
        url: "/newlogo.png",
        width: 800,
        height: 600,
        alt: "CurrentAdda - Best Current Affairs in Gujarati 2026",
      },
    ],
    locale: "gu_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Current Affairs in Gujarati 2026 | Daily Quiz, MCQs & Q&A | CurrentAdda",
    description: "Best Daily Current Affairs in Gujarati 2026. Questions & Answers for GSSSB CCE, GPSC, PSI, Constable & Talati. 10,000+ free MCQs updated daily!",
    images: ["/newlogo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CurrentAdda",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

import ClientProviders from '@/components/ClientProviders';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="gu" suppressHydrationWarning className={`${inter.variable} ${gujarati.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <ClientProviders />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
