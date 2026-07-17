import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { absoluteUrl } from "@/lib/seo";
import { buildMetadataKeywords, getSeoSettings } from "@/lib/seo-keywords";
import { getSiteConfig } from "@/lib/settings";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [config, seo] = await Promise.all([getSiteConfig(), getSeoSettings()]);
  const ogImage = absoluteUrl(config.aboutImage, config.url);

  return {
    metadataBase: new URL(config.url),
    title: {
      default: `${config.name} — ${config.tagline}`,
      template: `%s | ${config.name}`,
    },
    description: config.description,
    keywords: buildMetadataKeywords(seo, [config.author, config.name]),
    authors: [{ name: config.author, url: `${config.url}/hakkimda` }],
    creator: config.author,
    publisher: config.name,
    alternates: {
      canonical: config.url,
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: config.url,
      title: `${config.name} — ${config.tagline}`,
      description: config.description,
      siteName: config.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${config.author} — ${config.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.name} — ${config.tagline}`,
      description: config.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [{ url: config.logoIcon, type: "image/png" }],
      apple: [{ url: config.logoIcon, type: "image/png" }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-espresso">
        <JsonLd />
        {children}
        <FloatingActions whatsappUrl={config.whatsappUrl} />
      </body>
    </html>
  );
}
