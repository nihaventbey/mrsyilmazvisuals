import type { MetadataRoute } from "next";
import { getBlogPosts, getPortfolioCategories } from "@/lib/content";
import { isMaintenanceActive } from "@/lib/maintenance";
import { getSiteConfig } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getSiteConfig();
  const base = config.url.replace(/\/$/, "");
  const maintenanceOn = await isMaintenanceActive();

  if (maintenanceOn) {
    return [
      {
        url: `${base}/bakim`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${base}/gizlilik-politikasi`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
    ];
  }

  const staticRoutes = [
    "",
    "/hakkimda",
    "/portfolyo",
    "/blog",
    "/sss",
    "/iletisim",
    "/rezervasyon",
    "/cekilis",
    "/gizlilik-politikasi",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = (await getPortfolioCategories()).map((category) => ({
    url: `${base}/portfolyo/${category.slug}`,
    lastModified: new Date(),
  }));

  const blogRoutes = (await getBlogPosts()).map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
  }));

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes];
}
