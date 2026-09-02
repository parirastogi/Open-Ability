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
  title: "OpenAbility AI — Inclusive Career Intelligence & Accessible Hiring",
  description: "An AI-powered career companion that adapts the hiring experience to the way you communicate, work, and grow. Discovery matches tailored to your strengths.",
};

import { AuthProvider } from '@/context/AuthContext';
import { VoiceAgentProvider } from '@/context/VoiceAgentContext';
import VoiceAgentWidget from '@/components/layout/VoiceAgentWidget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <VoiceAgentProvider>
            {children}
            <VoiceAgentWidget />
          </VoiceAgentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
