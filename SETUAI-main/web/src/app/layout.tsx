import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLd } from "@/components/json-ld";
import { SiteChrome } from "@/components/site-chrome";
import { getSiteContent } from "@/lib/cms";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://setuai.org"),
  title: {
    default: "SetuAI | Practical AI Literacy",
    template: "%s | SetuAI",
  },
  description:
    "SetuAI is an active AI literacy initiative building practical, responsible learning with schools, educators, and community partners.",
  applicationName: "SetuAI",
  keywords: [
    "AI literacy",
    "AI education for kids",
    "nonprofit AI education",
    "school AI workshops",
    "responsible AI",
    "AI textbook",
    "Hindi AI education",
    "AI literacy partnerships",
  ],
  authors: [{ name: "SetuAI" }],
  creator: "SetuAI",
  publisher: "SetuAI",
  icons: {
    icon: { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf9",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--color-ink)]">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <SiteChrome content={content}>{children}</SiteChrome>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
