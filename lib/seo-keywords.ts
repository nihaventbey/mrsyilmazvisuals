import { cache } from "react";
import {
  createPublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";

export type SeoSettings = {
  keywords: string[];
  sectionEyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
};

/** Default target keywords (meta + JSON-LD + homepage section). */
export const DEFAULT_SEO_KEYWORDS = [
  "Konseptli Bebek Çekimi",
  "1 Yaş Doğum Günü Fotoğrafçısı",
  "Smash Cake (Pasta Patlatma) Çekimi",
  "Hastane Odası Doğum Fotoğrafçısı",
  "doğum fotoğrafçısı",
  "bebek fotoğrafçısı",
  "çocuk fotoğrafçısı",
  "yenidoğan çekimi",
  "düğün fotoğrafçısı",
  "Ankara Gölbaşı fotoğraf çekimi",
  "Gölbaşı bebek fotoğrafçısı",
  "Gölbaşı düğün fotoğrafçısı",
  "Ankara doğum fotoğrafçısı",
  "İstanbul doğum fotoğrafçısı",
  "İstanbul bebek fotoğrafçısı",
  "Üsküdar fotoğrafçı",
  "Mrs Yılmaz Visuals",
];

export const defaultSeoSettings: SeoSettings = {
  keywords: DEFAULT_SEO_KEYWORDS,
  sectionEyebrow: "Çekim türleri",
  sectionTitle: "Aradığınız anlar",
  sectionDescription:
    "Konseptli bebek, 1 yaş doğum günü, smash cake ve hastane odası doğum çekimleri dahil; aradığınız her özel anı samimi ve zarif karelerle ölümsüzleştiriyorum.",
};

export function formatKeywords(keywords: string[]): string {
  return keywords.join("\n");
}

export function parseKeywords(raw: string): string[] {
  return String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeSeoValue(value: unknown): SeoSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultSeoSettings;
  }

  const row = value as Partial<SeoSettings>;
  const keywords = Array.isArray(row.keywords)
    ? row.keywords.map((k) => String(k).trim()).filter(Boolean)
    : defaultSeoSettings.keywords;

  return {
    keywords: keywords.length > 0 ? keywords : defaultSeoSettings.keywords,
    sectionEyebrow:
      String(row.sectionEyebrow ?? "").trim() ||
      defaultSeoSettings.sectionEyebrow,
    sectionTitle:
      String(row.sectionTitle ?? "").trim() || defaultSeoSettings.sectionTitle,
    sectionDescription:
      String(row.sectionDescription ?? "").trim() ||
      defaultSeoSettings.sectionDescription,
  };
}

export const getSeoSettings = cache(async (): Promise<SeoSettings> => {
  if (!isSupabaseConfigured()) return defaultSeoSettings;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "seo")
    .maybeSingle();

  return normalizeSeoValue(data?.value);
});

/** Merge brand name into keyword list for metadata without duplicating. */
export function buildMetadataKeywords(
  seo: SeoSettings,
  extras: string[] = [],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...extras, ...seo.keywords]) {
    const key = String(raw ?? "").trim();
    if (!key) continue;
    const dedupe = key.toLocaleLowerCase("tr-TR");
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    out.push(key);
  }
  return out;
}
