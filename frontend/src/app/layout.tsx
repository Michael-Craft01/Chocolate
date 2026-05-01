import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { UsageBar } from "@/components/usage-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HyprLead | Lead Generation SaaS",
  description: "Next-generation lead generation engine with AI enrichment.",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'HyprLead | Next-Gen Revenue Discovery',
    description: 'Autonomous lead generation engine powered by high-fidelity AI discovery.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'HyprLead Neural Sphere' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HyprLead | Next-Gen Revenue Discovery',
    description: 'Autonomous lead generation engine powered by high-fidelity AI discovery.',
    images: ['/logo.png'],
  },
};

import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
