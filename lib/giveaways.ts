import { createHmac } from "node:crypto";
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
  if (!isSupabaseConfigured()) return getDemoGiveaways();

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

// Demo fallback giveaways so the verification UI is always interactive and functional
export function getDemoGiveaways(): Giveaway[] {
  return [
    {
      id: "demo-giveaway-1",
      title: "Yaz Fotoğraf Çekimi & Düğün Paketi Çekilişi",
      slug: "yaz-fotograf-cekimi-dugun-paketi-cekilisi",
      drawDate: "2026-08-01",
      description: "Mrs. Yılmaz Visuals 2026 Yaz Sezonu özel fotoğraf çekimi ve albüm hediyeli çekiliş sonuçları.",
      published: true,
      winners: [
        { id: "w1", role: "winner", username: "ayse_yildiz", sortOrder: 1 },
        { id: "w2", role: "winner", username: "elifece_demir", sortOrder: 2 },
      ],
      backups: [
        { id: "b1", role: "backup", username: "mehmet_kaya88", sortOrder: 1 },
        { id: "b2", role: "backup", username: "zeynep.visuals", sortOrder: 2 },
      ],
    },
    {
      id: "demo-giveaway-2",
      title: "Portre & Konsept Çekimi Hediye Çekilişi",
      slug: "portre-konsept-cekimi-hediye-cekilisi",
      drawDate: "2026-07-15",
      description: "Stüdyo ve dış mekan portre çekimi çekilişi sonuçları.",
      published: true,
      winners: [
        { id: "w3", role: "winner", username: "selin_karaca", sortOrder: 1 },
      ],
      backups: [
        { id: "b3", role: "backup", username: "caner_yavuz", sortOrder: 1 },
      ],
    },
  ];
}

export type VerificationStatus =
  | "winner"
  | "backup"
  | "participant"
  | "valid_draw"
  | "not_found";

export type GiveawayVerificationResult = {
  verified: boolean;
  code: string;
  query: string;
  giveawayTitle?: string;
  drawDate?: string;
  status: VerificationStatus;
  statusText: string;
  userRole?: "Kazanan" | "Yedek" | "Katılımcı";
  matchedUsername?: string;
  winners: string[];
  backups: string[];
  totalParticipants?: number;
  verificationHash?: string;
  verifiedAt?: string;
};

/**
 * Generates a verification code for a giveaway.
 * E.g., MRS-2026-X89A
 */
export function generateVerificationCode(giveawayId: string, title?: string): string {
  let hash = 0;
  const str = `${giveawayId}-${title || "mrsyilmaz"}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const cleanHex = Math.abs(hash).toString(36).toUpperCase().padStart(4, "0").slice(0, 4);
  const prefix = giveawayId.slice(0, 3).toUpperCase();
  return `MRS-${prefix}-${cleanHex}`;
}

/**
 * Generates an HMAC-SHA256 verification signature for live draw verification.
 */
export function generateDrawHash(
  title: string,
  winners: string[],
  backups: string[],
  timestamp: number,
): string {
  const secret =
    process.env.GIVEAWAY_SIGNING_SECRET?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "mrsyilmaz-giveaway-fallback";
  const payload = `${title}:${winners.join(",")}:${backups.join(",")}:${timestamp}`;
  const digest = createHmac("sha256", secret).update(payload).digest("hex");
  return `SHA256-${digest.slice(0, 16).toUpperCase()}`;
}

/**
 * Verifies a code or username against published giveaways
 */
export async function verifyGiveawayCode(rawQuery: string): Promise<GiveawayVerificationResult> {
  const query = rawQuery.trim();
  const cleanQuery = normalizeInstagramUsername(query).toLowerCase();
  const upperQuery = query.toUpperCase().replace(/\s+/g, "");

  if (!query) {
    return {
      verified: false,
      code: "",
      query: "",
      status: "not_found",
      statusText: "Lütfen bir doğrulama kodu veya Instagram kullanıcı adı giriniz.",
      winners: [],
      backups: [],
    };
  }

  // Get all giveaways (Supabase or Demo fallback)
  const giveaways = await getPublishedGiveaways();

  // 1. Direct match on demo codes only when Supabase is not configured (local demo mode)
  if (
    !isSupabaseConfigured() &&
    giveaways.length > 0 &&
    (upperQuery === "MRS-2026-WIN" ||
      upperQuery === "MRS-DEMO-88" ||
      upperQuery === "MRS-8821")
  ) {
    const g = giveaways[0];
    return {
      verified: true,
      code: upperQuery,
      query,
      giveawayTitle: g.title,
      drawDate: g.drawDate,
      status: "valid_draw",
      statusText: "Çekiliş kodu doğrulandı! Bu çekiliş Mrs. Yılmaz Visuals tarafından resmi olarak yapılmıştır.",
      winners: g.winners.map((w) => w.username),
      backups: g.backups.map((b) => b.username),
      totalParticipants: 450,
      verificationHash: generateDrawHash(g.title, g.winners.map(w => w.username), g.backups.map(b => b.username), 1700000000000),
      verifiedAt: new Date().toISOString(),
    };
  }

  // 2. Check each giveaway for verification code match, giveaway ID, slug match, or username match
  for (const giveaway of giveaways) {
    const code = generateVerificationCode(giveaway.id, giveaway.title);
    const shortIdCode = `MRS-${giveaway.id.slice(0, 8).toUpperCase()}`;

    const isCodeMatch =
      upperQuery === code ||
      upperQuery === shortIdCode ||
      upperQuery === giveaway.id.toUpperCase() ||
      upperQuery === giveaway.slug.toUpperCase();

    const winnersList = giveaway.winners.map((w) => w.username);
    const backupsList = giveaway.backups.map((b) => b.username);

    // Check if queried string matches a winner username
    const matchedWinner = giveaway.winners.find(
      (w) => normalizeInstagramUsername(w.username).toLowerCase() === cleanQuery,
    );

    // Check if queried string matches a backup username
    const matchedBackup = giveaway.backups.find(
      (b) => normalizeInstagramUsername(b.username).toLowerCase() === cleanQuery,
    );

    if (matchedWinner) {
      return {
        verified: true,
        code,
        query,
        giveawayTitle: giveaway.title,
        drawDate: giveaway.drawDate,
        status: "winner",
        statusText: `Tebrikler! @${matchedWinner.username} bu çekilişte KAZANAN Asil Talihli olarak belirlenmiştir! 🎉`,
        userRole: "Kazanan",
        matchedUsername: matchedWinner.username,
        winners: winnersList,
        backups: backupsList,
        verificationHash: generateDrawHash(giveaway.title, winnersList, backupsList, new Date(giveaway.drawDate).getTime()),
        verifiedAt: new Date().toISOString(),
      };
    }

    if (matchedBackup) {
      return {
        verified: true,
        code,
        query,
        giveawayTitle: giveaway.title,
        drawDate: giveaway.drawDate,
        status: "backup",
        statusText: `@${matchedBackup.username} bu çekilişte YEDEK Talihli olarak belirlenmiştir. ✨`,
        userRole: "Yedek",
        matchedUsername: matchedBackup.username,
        winners: winnersList,
        backups: backupsList,
        verificationHash: generateDrawHash(giveaway.title, winnersList, backupsList, new Date(giveaway.drawDate).getTime()),
        verifiedAt: new Date().toISOString(),
      };
    }

    if (isCodeMatch) {
      return {
        verified: true,
        code,
        query,
        giveawayTitle: giveaway.title,
        drawDate: giveaway.drawDate,
        status: "valid_draw",
        statusText: "Çekiliş doğrulama kodu geçerli. Tüm kazanan ve yedek listesi aşağıda sunulmuştur.",
        winners: winnersList,
        backups: backupsList,
        verificationHash: generateDrawHash(giveaway.title, winnersList, backupsList, new Date(giveaway.drawDate).getTime()),
        verifiedAt: new Date().toISOString(),
      };
    }
  }

  return {
    verified: false,
    code: "",
    query,
    status: "not_found",
    statusText: `"${query}" ile eşleşen bir çekiliş sonucu veya kullanıcı adı bulunamadı. Lütfen doğrulama kodunu kontrol edin.`,
    winners: [],
    backups: [],
  };
}

