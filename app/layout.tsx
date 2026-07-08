import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://transporterglobe.davidtphung.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Transporter Globe",
    template: "%s | Transporter Globe"
  },
  description:
    "SpaceX rideshare mission intelligence for Transporter payloads, orbital trails, Varda reentry paths, and provenance-aware manifests.",
  applicationName: "Transporter Globe",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Transporter Globe",
    description:
      "A SpaceX Transporter rideshare intelligence platform with 3D orbital context and provenance-aware payload manifests.",
    url: siteUrl,
    siteName: "Transporter Globe",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Transporter Globe",
    description:
      "SpaceX rideshare intelligence across Transporter missions, payloads, and capsule reentry tracks."
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg"
  },
  manifest: "/site.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
