import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    canonical: '/',
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

import ProtectContent from "@/components/ProtectContent";
import OneSignalInit from "@/components/OneSignalInit";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="gu" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <OneSignalInit />
        <ProtectContent />
        {children}
      </body>
    </html>
  );
}
