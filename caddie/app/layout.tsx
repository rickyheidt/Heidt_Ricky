import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";
import InstallBanner from "@/components/ui/InstallBanner";

export const metadata: Metadata = {
  title: "SKINZ",
  description: "Golf betting game tracker for groups",
  manifest: "/manifest.json",
  // Apple PWA meta tags
  appleWebApp: {
    capable: true,
    title: "SKINZ",
    statusBarStyle: "black-translucent",
    startupImage: [
      // iPhone 14 Pro Max
      {
        url: "/apple-icon.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 Pro
      {
        url: "/apple-icon.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 / 13 / 12
      {
        url: "/apple-icon.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone SE
      {
        url: "/apple-icon.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  // Open Graph
  openGraph: {
    title: "SKINZ",
    description: "Golf betting, elevated.",
    type: "website",
  },
  // Keywords
  keywords: ["golf", "betting", "skins", "nassau", "wolf", "handicap", "GHIN"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",           // fills the full iPhone screen (notch / home bar)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a4d3a" },
    { media: "(prefers-color-scheme: dark)", color: "#1a4d3a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Explicit apple-touch-icon for older iOS versions */}
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
      </head>
      <body>
        {/* Service worker registration (no-op on server) */}
        <ServiceWorkerRegister />

        <div className="mx-auto max-w-[430px] min-h-screen relative overflow-x-hidden">
          {children}
          {/* iOS "Add to Home Screen" install prompt (shows on iOS Safari only) */}
          <InstallBanner />
        </div>
      </body>
    </html>
  );
}
