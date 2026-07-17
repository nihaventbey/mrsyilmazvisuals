import type { SiteConfig, SocialLink } from "@/lib/settings";
import { toWhatsAppDigits } from "@/lib/whatsapp";

const FALLBACK_SITE_URL = "https://www.mrsyilmaz.com";

/**
 * Pick a public site origin. Rejects accidental Supabase / localhost values
 * (e.g. NEXT_PUBLIC_SITE_URL mistakenly set to the Supabase project URL).
 */
export function resolvePublicSiteUrl(
  ...candidates: Array<string | null | undefined>
): string {
  for (const raw of candidates) {
    const cleaned = String(raw ?? "").trim().replace(/\/$/, "");
    if (!cleaned) continue;
    try {
      const url = new URL(cleaned);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      const host = url.hostname.toLowerCase();
      if (
        host.endsWith(".supabase.co") ||
        host === "localhost" ||
        host.endsWith(".local") ||
        host === "127.0.0.1"
      ) {
        continue;
      }
      return `${url.protocol}//${url.host}`;
    } catch {
      // try next candidate
    }
  }
  return FALLBACK_SITE_URL;
}

export function absoluteUrl(path: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildOrganizationJsonLd(
  config: SiteConfig,
  socialLinks: SocialLink[],
  knowsAbout: string[] = [],
) {
  const sameAs = socialLinks.map((link) => link.href).filter(Boolean);
  if (config.whatsappUrl) {
    sameAs.push(config.whatsappUrl.split("?")[0]!);
  }

  const digits = config.whatsappPhone
    ? toWhatsAppDigits(config.whatsappPhone)
    : null;
  const telephone = digits ? `+${digits}` : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": `${config.url}/#organization`,
    name: config.name,
    alternateName: config.author,
    description: config.description,
    url: config.url,
    image: absoluteUrl(config.logoImage, config.url),
    logo: absoluteUrl(config.logoImage, config.url),
    ...(telephone ? { telephone } : {}),
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Ankara",
      },
      {
        "@type": "Place",
        name: "Gölbaşı, Ankara",
      },
      {
        "@type": "City",
        name: "İstanbul",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: config.location,
      addressCountry: "TR",
    },
    founder: {
      "@type": "Person",
      name: config.author,
    },
    knowsAbout:
      knowsAbout.length > 0
        ? knowsAbout
        : [
            "Doğum fotoğrafçılığı",
            "Hamile çekimi",
            "Yenidoğan fotoğrafçılığı",
            "Bebek fotoğrafçılığı",
            "Çocuk fotoğrafçılığı",
            "Düğün fotoğrafçılığı",
            "Ankara Gölbaşı fotoğraf çekimi",
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

export function buildFaqPageJsonLd(
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildArticleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName: string;
  publisherName: string;
  publisherLogo: string;
  siteUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    ...(input.image ? { image: [input.image] } : {}),
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: input.publisherName,
      logo: {
        "@type": "ImageObject",
        url: input.publisherLogo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
  };
}
