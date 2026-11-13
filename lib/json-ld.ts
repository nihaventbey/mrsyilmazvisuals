/**
 * Safely serializes JSON-LD for embedding inside <script type="application/ld+json">.
 * Escapes "<" to "\u003c" to prevent "</script>" breakout XSS.
 */
export function serializeJsonLd(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
