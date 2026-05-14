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
    default: "Daily Current Affairs in Gujarati 2026 | GPSC, GSSSB, Talati – Free Quiz",
    template: "%s | CurrentAdda - કરંટ અફેર્સ ગુજરાતી 2026"
  },
  description: "ગુજરાતીમાં રોજ અપડેટ! GPSC, GSSSB, PSI, Talati માટે Free MCQ Quiz + Leaderboard. 10,000+ પ્રશ્નો.",
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
    title: "Daily Current Affairs in Gujarati 2026 | GPSC, GSSSB, Talati – Free Quiz",
    description: "ગુજરાતીમાં રોજ અપડેટ! GPSC, GSSSB, PSI, Talati માટે Free MCQ Quiz + Leaderboard. 10,000+ પ્રશ્નો.",
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
    title: "Daily Current Affairs in Gujarati 2026 | GPSC, GSSSB, Talati – Free Quiz",
    description: "ગુજરાતીમાં રોજ અપડેટ! GPSC, GSSSB, PSI, Talati માટે Free MCQ Quiz + Leaderboard. 10,000+ પ્રશ્નો.",
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
