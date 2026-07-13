import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";
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
  const config = await getSiteConfig();
  const ogImage = absoluteUrl(config.aboutImage, config.url);

  return {
    metadataBase: new URL(config.url),
    title: {
      default: `${config.name} — ${config.tagline}`,
      template: `%s | ${config.name}`,
    },
    description: config.description,
    keywords: [
      config.author,
      config.name,
      "doğum fotoğrafçısı",
      "bebek fotoğrafçısı",
      "hamile çekimi",
      "yenidoğan çekimi",
      "düğün fotoğrafçısı",
      "Üsküdar fotoğrafçı",
      "İstanbul doğum fotoğrafçısı",
      "İstanbul bebek fotoğrafçısı",
      "Mrs Yılmaz Visuals",
    ],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-espresso">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
