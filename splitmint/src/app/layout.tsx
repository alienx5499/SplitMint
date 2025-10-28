import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DevProvider } from "@/contexts/DevContext";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitMint - Expense Splitting Made Easy",
  description: "Split expenses with friends and family effortlessly. Track shared costs, settle payments, and manage group finances with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DevProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <Analytics />
          </AuthProvider>
        </DevProvider>
      </body>
    </html>
  );
}
