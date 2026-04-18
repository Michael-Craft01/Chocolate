import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { UsageBar } from "@/components/usage-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chocolate | Lead Generation SaaS",
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
        <div className="flex h-screen bg-background">
          <div className="flex flex-col border-r border-card-border bg-card overflow-hidden">
            <Sidebar />
            <div className="mt-auto border-t border-card-border bg-black/20">
              <UsageBar />
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
