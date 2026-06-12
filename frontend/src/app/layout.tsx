import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PwaProvider } from "@/components/pwa-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

const getSanitizedBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_APP_URL || 
    process.env.FRONTEND_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://hyprlead.app");
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
};

const baseUrl = getSanitizedBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
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
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: 'HyprLead | Next-Gen Revenue Discovery',
    description: 'Autonomous lead generation engine powered by high-fidelity AI discovery.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HyprLead' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HyprLead | Next-Gen Revenue Discovery',
    description: 'Autonomous lead generation engine powered by high-fidelity AI discovery.',
    images: ['/og-image.png'],
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
    <html lang="en" className="dark" suppressHydrationWarning>
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
