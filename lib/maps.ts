/** Normalize a Google Maps share/place URL into an embeddable iframe src. */
export function toGoogleMapsEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  if (input.includes("/maps/embed") || input.includes("output=embed")) {
    return input;
  }

  const atMatch = input.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&z=15&output=embed`;
  }

  const dMatch = input.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (dMatch) {
    return `https://www.google.com/maps?q=${dMatch[1]},${dMatch[2]}&z=15&output=embed`;
  }

  try {
    const url = new URL(input);
    const q = url.searchParams.get("q") || url.searchParams.get("query");
    if (q) {
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
    if (
      url.hostname.includes("google.") ||
      url.hostname.includes("maps.app.goo.gl") ||
      url.hostname.includes("goo.gl")
    ) {
      return `https://www.google.com/maps?q=${encodeURIComponent(input)}&output=embed`;
    }
  } catch {
    // treat as plain address text below
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(input)}&output=embed`;
}

/** Public link for “open in Google Maps”. */
export function toGoogleMapsLink(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  if (
    input.startsWith("http://") ||
    input.startsWith("https://") ||
    input.includes("maps.app.goo.gl") ||
    input.includes("google.com/maps")
  ) {
    return input.startsWith("http") ? input : `https://${input}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input)}`;
}
