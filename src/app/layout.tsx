import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stop Loss Scholar",
  description: "Learn Exactly Where to Draw the Line - Visual stop-loss levels and position sizing for beginner crypto investors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-slate-950 text-white antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
