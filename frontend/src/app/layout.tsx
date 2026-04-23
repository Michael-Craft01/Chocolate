import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { UsageBar } from "@/components/usage-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HyprLead | Lead Generation SaaS",
  description: "Next-generation lead generation engine with AI enrichment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
