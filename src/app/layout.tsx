import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { MainLayout } from "@/components/layout/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolutionConfig | Commercial Automation",
  description: "Automated BOQ/BOM Generator for Hardware Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-foreground`}>
        <NextAuthProvider>
          <div className="min-h-screen flex">
            <Navbar />
            <MainLayout>
              {children}
            </MainLayout>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
