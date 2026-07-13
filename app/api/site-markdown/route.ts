import {
  isMarkdownEligiblePath,
  renderMarkdownForPath,
} from "@/lib/markdown-pages";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/";

  if (!isMarkdownEligiblePath(path)) {
    return new Response("Not Found", { status: 404 });
  }

  const markdown = await renderMarkdownForPath(path);
  if (!markdown) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
      "Cache-Control": "public, max-age=300",
    },
  });
}
