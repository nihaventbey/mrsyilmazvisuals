export type AdSenseSlotId =
  | "homeAfterBlog"
  | "homeAfterCta"
  | "blogIndex"
  | "blogAfterPost"
  | "portfolioAfterGallery";

export type AdSenseSlotConfig = {
  enabled: boolean;
  /** AdSense ad unit slot ID (from AdSense console). */
  slotId: string;
};

export type AdSenseSettings = {
  enabled: boolean;
  /** e.g. ca-pub-1234567890123456 */
  publisherId: string;
  /**
   * Show ads with data-adtest="on" (useful on localhost / preview).
   * Turn off on production when going live.
   */
  testMode: boolean;
  slots: Record<AdSenseSlotId, AdSenseSlotConfig>;
};

export const ADSENSE_SLOT_META: Record<
  AdSenseSlotId,
  { label: string; hint: string }
> = {
  homeAfterBlog: {
    label: "Ana sayfa — blog önizleme sonrası",
    hint: "BlogPreview ile CTA bandı arasında",
  },
  homeAfterCta: {
    label: "Ana sayfa — CTA sonrası",
    hint: "CTA ile Instagram arasında",
  },
  blogIndex: {
    label: "Blog listesi",
    hint: "Başlık altında, yazı grid’inin üstünde",
  },
  blogAfterPost: {
    label: "Blog yazısı sonu",
    hint: "Yazı içeriği ile rezervasyon CTA arası",
  },
  portfolioAfterGallery: {
    label: "Portfolyo kategori",
    hint: "Galeri sonrası, diğer kategoriler öncesi",
  },
};

function emptySlot(): AdSenseSlotConfig {
  return { enabled: false, slotId: "" };
}

export const defaultAdSenseSettings: AdSenseSettings = {
  enabled: true,
  publisherId: "ca-pub-3156607388655691",
  testMode: false,
  slots: {
    homeAfterBlog: emptySlot(),
    homeAfterCta: emptySlot(),
    blogIndex: emptySlot(),
    blogAfterPost: emptySlot(),
    portfolioAfterGallery: emptySlot(),
  },
};

/** Normalize ca-pub-… → pub-… for ads.txt */
export function toAdsTxtPublisherId(publisherId: string): string | null {
  const raw = publisherId.trim();
  if (!raw) return null;
  if (/^pub-\d+$/i.test(raw)) return raw.toLowerCase();
  const match = raw.match(/^(?:ca-)?(pub-\d+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export function normalizePublisherId(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^ca-pub-\d+$/i.test(value)) return value.toLowerCase();
  if (/^pub-\d+$/i.test(value)) return `ca-${value.toLowerCase()}`;
  return value;
}
