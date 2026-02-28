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
    default: "CurrentAdda - Best Current Affairs Gujarati for GPSC & GSSSB",
    template: "%s | CurrentAdda Gujarati"
  },
  description: "Daily Updated Current Affairs Gujarati (કરંટ અફેર્સ ગુજરાતી) for GPSC, GSSSB, Police Bharti, and all Gujarat Government Exams. High-quality daily quizzes and study material.",
  keywords: [
    "Current Affairs Gujarati",
    "કરંટ અફેર્સ ગુજરાતી",
    "Daily Current Affairs Gujarati",
    "GPSC Current Affairs",
    "GSSSB Current Affairs Gujarati",
    "Gujarat Government Jobs Preparation",
    "Current Affairs 2026 Gujarati",
    "Latest Current Affairs Gujarat"
  ],
  authors: [{ name: "CurrentAdda Team" }],
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
    title: "CurrentAdda - Daily Gujarati Current Affairs Quiz",
    description: "Daily live current affairs quizzes in Gujarati for GPSC and GSSSB exams.",
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
    title: "CurrentAdda - Daily Gujarati Current Affairs",
    description: "Play daily live current affairs quizzes in Gujarati for GPSC and GSSSB exams.",
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
  maximumScale: 1,
  userScalable: false,
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
