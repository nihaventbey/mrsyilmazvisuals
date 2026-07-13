import { getSiteConfig } from "@/lib/settings";

export async function GET() {
  const config = await getSiteConfig();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? config.url).replace(
    /\/$/,
    "",
  );

  const catalog = {
    linkset: [
      {
        anchor: `${base}/`,
        "service-doc": [
          { href: `${base}/llms.txt`, type: "text/plain" },
          { href: `${base}/hakkimda`, type: "text/html" },
        ],
        status: [{ href: `${base}/.well-known/health`, type: "application/json" }],
        enclosure: [
          {
            href: `${base}/.well-known/agent-skills/index.json`,
            type: "application/json",
          },
        ],
        describedby: [{ href: `${base}/llms.txt`, type: "text/plain" }],
        alternate: [
          {
            href: `${base}/sitemap.xml`,
            type: "application/xml",
          },
        ],
      },
    ],
  };

  return Response.json(catalog, {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
