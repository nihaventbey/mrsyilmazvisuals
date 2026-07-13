const MARKDOWN_PATHS = new Set(["/", "/hakkimda", "/iletisim", "/sss"]);

export function isMarkdownEligiblePath(pathname: string): boolean {
  return MARKDOWN_PATHS.has(pathname);
}

export function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const prefersMarkdown =
    /text\/markdown/i.test(accept) || /text\/x-markdown/i.test(accept);
  if (!prefersMarkdown) return false;
  const mdQ =
    quality(accept, "text/markdown") ?? quality(accept, "text/x-markdown");
  const htmlQ = quality(accept, "text/html");
  if (mdQ == null) return false;
  if (htmlQ == null) return true;
  return mdQ >= htmlQ;
}

function quality(accept: string, type: string): number | null {
  const parts = accept.split(",").map((p) => p.trim());
  for (const part of parts) {
    const [media, ...params] = part.split(";").map((s) => s.trim());
    if (!media) continue;
    if (media === type || media === "*/*" || media === "text/*") {
      const qParam = params.find((p) => p.startsWith("q="));
      const q = qParam ? Number(qParam.slice(2)) : 1;
      return Number.isFinite(q) ? q : 1;
    }
  }
  return null;
}
