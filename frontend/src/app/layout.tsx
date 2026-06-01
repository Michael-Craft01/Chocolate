import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PwaProvider } from "@/components/pwa-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://hyprlead.app"),
  title: "HyprLead | Lead Generation SaaS",
  description: "Next-generation lead generation engine with AI enrichment.",
  applicationName: "HyprLead",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HyprLead",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
    apple: "/apple-touch-icon.png",
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

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <PwaProvider />
        <Toaster />
      </body>
    </html>
  );
}
