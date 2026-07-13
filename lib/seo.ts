import type { SiteConfig, SocialLink } from "@/lib/settings";

export function absoluteUrl(path: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildOrganizationJsonLd(
  config: SiteConfig,
  socialLinks: SocialLink[],
) {
  const sameAs = socialLinks.map((link) => link.href).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${config.url}/#organization`,
    name: config.name,
    alternateName: config.author,
    description: config.description,
    url: config.url,
    image: absoluteUrl(config.logoImage, config.url),
    logo: absoluteUrl(config.logoImage, config.url),
    areaServed: {
      "@type": "City",
      name: "İstanbul",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: config.location,
      addressCountry: "TR",
    },
    founder: {
      "@type": "Person",
      name: config.author,
    },
    knowsAbout: [
      "Doğum fotoğrafçılığı",
      "Hamile çekimi",
      "Yenidoğan fotoğrafçılığı",
      "Bebek fotoğrafçılığı",
      "Düğün fotoğrafçılığı",
    ],
    sameAs,
  };
}

export function buildPersonJsonLd(config: SiteConfig, socialLinks: SocialLink[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${config.url}/#person`,
    name: config.author,
    jobTitle: "Fotoğrafçı",
    description: config.description,
    url: `${config.url}/hakkimda`,
    image: absoluteUrl(config.aboutImage, config.url),
    worksFor: {
      "@id": `${config.url}/#organization`,
    },
    sameAs: socialLinks.map((link) => link.href),
  };
}

export function buildWebsiteJsonLd(config: SiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${config.url}/#website`,
    name: config.name,
    url: config.url,
    description: config.description,
    inLanguage: "tr-TR",
    publisher: {
      "@id": `${config.url}/#organization`,
    },
  };
}
