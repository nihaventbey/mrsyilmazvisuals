import { getSiteConfig } from "@/lib/settings";

export async function GET() {
  const config = await getSiteConfig();
  const base = config.url.replace(/\/$/, "");

  const body = [
    "User-agent: *",
    "Allow: /",
    "Allow: /bakim",
    "Disallow: /admin",
    "Disallow: /admin/",
    "",
    `# llms.txt: ${base}/llms.txt`,
    `Sitemap: ${base}/sitemap.xml`,
    "Content-Signal: search=yes, ai-train=no, ai-input=yes",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
