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
    default: "Current Affairs in Gujarati 2026 | Daily Quiz & MCQs | CCE, GPSC | CurrentAdda",
    template: "%s | CurrentAdda - કરંટ અફેર્સ ગુજરાતી"
  },
  description: "Free Daily Current Affairs Quiz in Gujarati (કરંટ અફેર્સ ગુજરાતી 2026). 10,000+ MCQs for GSSSB CCE (7338 Posts), GPSC, PSI, Constable & Talati. Play live quizzes, track your rank on leaderboard. Updated daily!",
  keywords: [
    "Current Affairs in Gujarati",
    "કરંટ અફેર્સ ગુજરાતી",
    "current affairs in gujarati",
    "Daily Current Affairs Gujarati 2026",
    "GPSC Current Affairs",
    "GPSC Current Affairs in Gujarati",
    "GSSSB Current Affairs Gujarati",
    "Gujarat Government Jobs Preparation",
    "Current Affairs 2026 Gujarati",
    "Latest Current Affairs Gujarat",
    "Current Affairs Quiz Gujarati",
    "કરંટ અફેર્સ ક્વિઝ",
    "Current Affairs MCQ Gujarati",
    "Monthly Current Affairs Gujarati",
    "Daily GK Quiz Gujarati",
    "PSI Current Affairs Gujarati",
    "Constable Exam Current Affairs",
    "Talati Exam Preparation Gujarati",
    "Bin Sachivalay Current Affairs",
    "CCE Current Affairs Gujarati",
    "GSSSB CCE 2026",
    "CCE 2026 Current Affairs"
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
    title: "Current Affairs in Gujarati 2026 | Daily Quiz & MCQs | CurrentAdda",
    description: "Free Daily Current Affairs Quiz in Gujarati (કરંટ અફેર્સ ગુજરાતી 2026). 10,000+ MCQs for GPSC, GSSSB, PSI & more. Play live quizzes, compete on leaderboard!",
    url: "https://currentadda.vercel.app",
    siteName: "CurrentAdda",
    images: [
      {
        url: "/newlogo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "gu_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Current Affairs in Gujarati 2026 | Daily Quiz & MCQs",
    description: "Free Daily Current Affairs Quiz in Gujarati. 10,000+ MCQs for GPSC, GSSSB, PSI, Constable & Talati. Play live quizzes, track rank on leaderboard!",
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
        {/* Globally Hidden SEO Context */}
        <div className="sr-only">
          <h1>CurrentAdda - Best Platform for Gujarati Current Affairs Quizzes</h1>
          <p>
            CurrentAdda is the premier destination for students preparing for Gujarat Government competitive exams like GPSC, GSSSB, Police Bharti, and Bin Sachivalay.
            We provide daily updated current affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી), subject-wise MCQs, and category-wise practice tests.
            Our platform features regular quizzes on History, Politics, Geography, Science, and more, helping you stay ahead in your preparation.
            Join thousands of candidates on our leaderboard and track your daily progress with our streak system.
          </p>
          <nav>
            <a href="/current-affairs-in-gujarati">Current Affairs in Gujarati</a>
            <a href="/subjects">Subject-wise Quizzes</a>
            <a href="/categories">Category-wise Quizzes</a>
            <a href="/leaderboard">Real-time Leaderboard</a>
            <a href="/author">Content Expert Profile</a>
          </nav>
        </div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
