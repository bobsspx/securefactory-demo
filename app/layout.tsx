import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecureFactory | Industrial Digital Solutions",
  description:
    "SecureFactory demonstration project showcasing modern industrial web development, business automation and cybersecurity.",
  keywords: [
    "Factory Website",
    "Industrial Website",
    "Web Development",
    "Business Automation",
    "Cybersecurity",
    "Next.js",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
     <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
