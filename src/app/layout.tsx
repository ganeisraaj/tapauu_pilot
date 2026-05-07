import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
        {children}
      </body>
    </html>
  );
}
