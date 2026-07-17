export type GeminiImageMarker = {
  fullMatch: string;
  prompt: string;
  alt: string;
  index: number;
};

/** <!-- gemini-image: prompt text | alt: Turkish alt text --> */
const MARKER_RE =
  /<!--\s*gemini-image:\s*([^|>]+?)(?:\s*\|\s*alt:\s*([^>]*?))?\s*-->/gi;

export function parseGeminiImageMarkers(content: string): GeminiImageMarker[] {
  const markers: GeminiImageMarker[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(MARKER_RE.source, MARKER_RE.flags);
  while ((match = re.exec(content)) !== null) {
    markers.push({
      fullMatch: match[0],
      prompt: match[1].trim(),
      alt: (match[2] ?? "").trim() || "Blog görseli",
      index: match.index,
    });
  }
  return markers;
}

export function replaceFirstMarker(
  content: string,
  marker: GeminiImageMarker,
  markdownImage: string,
): string {
  const idx = content.indexOf(marker.fullMatch);
  if (idx < 0) return content;
  return (
    content.slice(0, idx) +
    markdownImage +
    content.slice(idx + marker.fullMatch.length)
  );
}

export function countRemainingMarkers(content: string): number {
  return parseGeminiImageMarkers(content).length;
}

export const MAX_BLOG_IMAGES_PER_RUN = 4;

export function slugifyBlogPathSegment(raw: string): string {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return value || "yazi";
}
