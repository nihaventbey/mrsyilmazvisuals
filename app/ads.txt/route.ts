import { buildAdsTxt } from "@/lib/adsense";

export async function GET() {
  const body = await buildAdsTxt();

  if (!body) {
    return new Response("# AdSense disabled or publisher ID missing\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
