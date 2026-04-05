import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import CreatorSignature from "@/components/ui/CreatorSignature";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueFeedback",
  description:
    "Share and receive anonymous feedback with a clean, guided, and responsive experience.",
  creator: "Talha",
  applicationName: "TrueFeedback",
  keywords: ["anonymous", "feedback", "nextjs", "gemini"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CreatorSignature />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
