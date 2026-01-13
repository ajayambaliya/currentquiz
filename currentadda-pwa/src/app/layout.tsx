import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CurrentAdda - Daily Gujarati Current Affairs Quiz",
  description: "Play daily live current affairs quizzes in Gujarati for GPSC and GSSSB exams.",
  manifest: "/manifest.json",
  icons: {
    icon: "/newlogo.png",
    shortcut: "/newlogo.png",
    apple: "/newlogo.png",
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
    <html lang="gu">
      <body className="antialiased" suppressHydrationWarning>
        <OneSignalInit />
        <ProtectContent />
        {children}
      </body>
    </html>
  );
}
