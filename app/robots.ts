import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getSiteConfig();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? config.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
