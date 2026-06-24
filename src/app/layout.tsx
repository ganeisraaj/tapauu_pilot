import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "TAPAUU | Student Savings",
  description: "Guaranteed savings for students. Fast, clean, and friendly meal subscriptions.",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(sora.variable, "font-sans min-h-screen flex flex-col bg-background selection:bg-primary/20")} suppressHydrationWarning>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
