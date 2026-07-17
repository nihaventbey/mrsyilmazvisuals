import {
  buildOrganizationJsonLd,
  buildPersonJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo";
import { getSeoSettings } from "@/lib/seo-keywords";
import { getSiteConfig, getSocialLinks } from "@/lib/settings";

export async function JsonLd() {
  const [config, socialLinks, seo] = await Promise.all([
    getSiteConfig(),
    getSocialLinks(),
    getSeoSettings(),
  ]);

  const payload = [
    buildOrganizationJsonLd(config, socialLinks, seo.keywords),
    buildPersonJsonLd(config, socialLinks),
    buildWebsiteJsonLd(config),
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
