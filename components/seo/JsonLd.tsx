import {
  buildOrganizationJsonLd,
  buildPersonJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo";
import { getSiteConfig, getSocialLinks } from "@/lib/settings";

export async function JsonLd() {
  const [config, socialLinks] = await Promise.all([
    getSiteConfig(),
    getSocialLinks(),
  ]);

  const payload = [
    buildOrganizationJsonLd(config, socialLinks),
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
