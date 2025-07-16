import type { Metadata } from "next";
import { Lexend, Geist_Mono } from "next/font/google";
import "./globals.css";

const fonts = Lexend({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Analyze.AI",
  description: "Assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fonts.className} ${mono.variable} antialiased dark`}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
