import { cache } from "react";
import {
  buildDefaultHeroCards,
  defaultHeroSettings,
  type HeroCard,
  type HeroSettings,
} from "@/lib/hero-defaults";
import {
  createPublicClient,
  isSupabaseConfigured,
  storagePublicUrl,
} from "@/lib/supabase/public";

export type ResolvedHeroCard = HeroCard & {
  imageUrl: string | null;
};

function normalizeCard(value: unknown, index: number): HeroCard | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<HeroCard>;
  const caption = String(row.caption ?? "").trim();
  if (!caption) return null;

  const palette = Array.isArray(row.palette) && row.palette.length === 3
    ? (row.palette.map(String) as [string, string, string])
    : buildDefaultHeroCards()[index % buildDefaultHeroCards().length].palette;

  return {
    id: String(row.id ?? `hero-${index}`),
    caption,
    image: String(row.image ?? ""),
    palette,
    enabled: row.enabled !== false,
  };
}

function mergeHeroSettings(value: unknown): HeroSettings {
  if (!value || typeof value !== "object") return defaultHeroSettings;
  const partial = value as Partial<HeroSettings>;
  const cards = Array.isArray(partial.cards)
    ? partial.cards
        .map((card, index) => normalizeCard(card, index))
        .filter((card): card is HeroCard => card !== null)
    : [];

  return {
    cards: cards.length > 0 ? cards : defaultHeroSettings.cards,
  };
}

function resolveHeroImage(path: string): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return storagePublicUrl("site", path);
}

export const getHeroSettings = cache(async (): Promise<HeroSettings> => {
  if (!isSupabaseConfigured()) return defaultHeroSettings;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero")
    .maybeSingle();

  return mergeHeroSettings(data?.value);
});

export const getHeroCards = cache(async (): Promise<ResolvedHeroCard[]> => {
  const settings = await getHeroSettings();
  return settings.cards
    .filter((card) => card.enabled)
    .map((card) => ({
      ...card,
      imageUrl: resolveHeroImage(card.image),
    }));
});

export type { HeroCard, HeroSettings } from "@/lib/hero-defaults";
