import type { Metadata } from "next";
import { MaintenanceView } from "@/components/maintenance/MaintenanceView";
import { getMaintenanceSettings } from "@/lib/maintenance";
import { getSiteConfig, getSocialLinks } from "@/lib/settings";
import {
  absoluteUrl,
  buildOrganizationJsonLd,
  resolvePublicSiteUrl,
} from "@/lib/seo";

const PAGE_TITLE = "Çok Yakında | Mrs. Yılmaz Visuals";
const PAGE_DESCRIPTION =
  "Mrs. Yılmaz Visuals çok yakında açılıyor. Ankara Gölbaşı'ndaki ev stüdyomuzda yenidoğan, doğum ve gelin & damat fotoğraf çekimleri için ilk rezervasyon dönemimiz başlıyor.";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const base = resolvePublicSiteUrl(config.url, process.env.NEXT_PUBLIC_SITE_URL);
  const canonical = absoluteUrl("/bakim", base);
  const ogImage = absoluteUrl(config.logoIcon || config.logoImage, base);

  return {
    title: { absolute: PAGE_TITLE },
    description: PAGE_DESCRIPTION,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: canonical,
      siteName: config.name,
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      images: [
        {
          url: ogImage,
          alt: `${config.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      images: [ogImage],
    },
  };
}

export default async function MaintenancePage() {
  const [maintenance, config, socialLinks] = await Promise.all([
    getMaintenanceSettings(),
    getSiteConfig(),
    getSocialLinks(),
  ]);

  const email =
    process.env.CONTACT_EMAIL?.trim() || "merhaba@mrsyilmaz.com";
  const organization = buildOrganizationJsonLd(config, socialLinks);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...organization,
            description: PAGE_DESCRIPTION,
            email,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Gölbaşı",
              addressRegion: "Ankara",
              addressCountry: "TR",
            },
          }),
        }}
      />
      <MaintenanceView
        maintenance={maintenance}
        config={config}
        contactEmail={email}
      />
    </>
  );
}
