import { cache } from "react";
import {
  createPublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";

export type GiveawayEntrantRole = "winner" | "backup";

export type GiveawayEntrant = {
  id: string;
  role: GiveawayEntrantRole;
  username: string;
  sortOrder: number;
};

export type Giveaway = {
  id: string;
  title: string;
  slug: string;
  drawDate: string;
  description: string;
  published: boolean;
  winners: GiveawayEntrant[];
  backups: GiveawayEntrant[];
};

export function normalizeInstagramUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\?.*$/, "")
    .trim();
}

export function instagramProfileUrl(username: string): string {
  const clean = normalizeInstagramUsername(username);
  return `https://www.instagram.com/${encodeURIComponent(clean)}/`;
}

export function slugifyGiveawayTitle(title: string): string {
  return title
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type DbGiveaway = {
  id: string;
  title: string;
  slug: string;
  draw_date: string;
  description: string;
  published: boolean;
  giveaway_entrants?: {
    id: string;
    role: string;
    username: string;
    sort_order: number;
  }[];
};

function mapGiveaway(row: DbGiveaway): Giveaway {
  const entrants = (row.giveaway_entrants ?? [])
    .map((e) => ({
      id: e.id,
      role: e.role as GiveawayEntrantRole,
      username: e.username,
      sortOrder: e.sort_order,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    drawDate: row.draw_date,
    description: row.description ?? "",
    published: row.published,
    winners: entrants.filter((e) => e.role === "winner"),
    backups: entrants.filter((e) => e.role === "backup"),
  };
}

export const getPublishedGiveaways = cache(async (): Promise<Giveaway[]> => {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("giveaways")
    .select(
      "id, title, slug, draw_date, description, published, giveaway_entrants(id, role, username, sort_order)",
    )
    .eq("published", true)
    .order("draw_date", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapGiveaway(row as DbGiveaway));
});
