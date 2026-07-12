import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
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
    ],
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: config.url,
      title: `${config.name} — ${config.tagline}`,
      description: config.description,
      siteName: config.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.name} — ${config.tagline}`,
      description: config.description,
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
        {children}
      </body>
    </html>
  );
}
