import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TAPAUU - Pilot Phase",
  description: "Seamless meal subscriptions for campus life.",
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
      <body className={cn(inter.className, "min-h-screen flex flex-col bg-slate-50")} suppressHydrationWarning>
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container flex h-28 items-center justify-between px-4 md:px-8">
            <div className="flex items-center justify-start">
              <a href="/" className="hover:scale-105 transition-transform duration-300">
                <img src="/favicon.svg" alt="TAPAUU" className="h-20 w-20 drop-shadow-md" />
              </a>
            </div>
            <nav className="flex items-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <a href="/admin" className="hover:text-primary transition-colors">Admin</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t bg-white py-6">
          <div className="container px-4 text-center text-sm text-slate-500">
            © 2026 TAPAUU Pilot Project. Built for speed.
          </div>
        </footer>
      </body>
    </html>
  );
}
