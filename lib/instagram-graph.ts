import type { ResolvedInstagramPost } from "@/lib/instagram";

const FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

type GraphMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
};

type GraphMediaResponse = {
  data?: GraphMedia[];
  error?: { message: string; code?: number; error_subcode?: number };
};

type GraphProfileResponse = {
  id?: string;
  username?: string;
  error?: { message: string; code?: number };
};

export type InstagramGraphStatus = {
  configured: boolean;
  connected: boolean;
  username?: string;
  userId?: string;
  host?: string;
  error?: string;
};

function configuredHosts(): string[] {
  const preferred = process.env.INSTAGRAM_GRAPH_HOST?.trim().replace(/\/$/, "");
  const defaults = [
    "https://graph.instagram.com",
    "https://graph.facebook.com",
  ];
  if (preferred && !defaults.includes(preferred)) {
    return [preferred, ...defaults];
  }
  if (preferred) {
    return [preferred, ...defaults.filter((h) => h !== preferred)];
  }
  return defaults;
}

export function isInstagramGraphConfigured(): boolean {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN?.trim());
}

function accessToken(): string {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN ortam değişkeni tanımlı değil.");
  }
  return token;
}

function mediaPath(): string {
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  return userId ? `/${userId}/media` : "/me/media";
}

async function graphFetchJson<T>(url: URL): Promise<T> {
  const res = await fetch(
    url.toString(),
    process.env.NODE_ENV === "development"
      ? { cache: "no-store" }
      : { next: { revalidate: 300, tags: ["instagram"] } },
  );

  const body = (await res.json()) as T & {
    error?: { message: string };
  };

  if (!res.ok || body.error) {
    throw new Error(
      body.error?.message ?? `Instagram API hatası (${res.status})`,
    );
  }

  return body;
}

/** Try Instagram Login host first, then Facebook Login host (or reverse if configured). */
async function graphFetchAcrossHosts<T>(
  buildPath: (host: string) => URL,
): Promise<{ data: T; host: string }> {
  const hosts = configuredHosts();
  const errors: string[] = [];

  for (const host of hosts) {
    try {
      const data = await graphFetchJson<T>(buildPath(host));
      return { data, host };
    } catch (error) {
      errors.push(
        `${host}: ${error instanceof Error ? error.message : "bilinmeyen hata"}`,
      );
    }
  }

  throw new Error(errors.join(" | ") || "Instagram Graph isteği başarısız.");
}

function toFeedPost(item: GraphMedia): ResolvedInstagramPost | null {
  const imageUrl =
    item.media_type === "VIDEO"
      ? item.thumbnail_url ?? item.media_url ?? null
      : item.media_url ?? item.thumbnail_url ?? null;

  if (!imageUrl || !item.permalink) return null;

  return {
    id: item.id,
    image: imageUrl,
    url: item.permalink,
    enabled: true,
    imageUrl,
  };
}

export async function fetchInstagramGraphProfile(): Promise<{
  id: string;
  username: string;
  host: string;
}> {
  const { data, host } = await graphFetchAcrossHosts<GraphProfileResponse>(
    (base) => {
      const url = new URL(`${base}/me`);
      url.searchParams.set("fields", "id,username");
      url.searchParams.set("access_token", accessToken());
      return url;
    },
  );

  if (!data.id || !data.username) {
    throw new Error("Instagram profil bilgisi alınamadı.");
  }

  return { id: data.id, username: data.username, host };
}

export async function fetchInstagramGraphPosts(
  limit: number,
): Promise<ResolvedInstagramPost[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 25);

  const { data } = await graphFetchAcrossHosts<GraphMediaResponse>((base) => {
    const url = new URL(`${base}${mediaPath()}`);
    url.searchParams.set("fields", FIELDS);
    url.searchParams.set("limit", String(safeLimit));
    url.searchParams.set("access_token", accessToken());
    return url;
  });

  const posts = (data.data ?? [])
    .map(toFeedPost)
    .filter((post): post is ResolvedInstagramPost => post !== null);

  return posts.slice(0, limit);
}

export async function getInstagramGraphStatus(): Promise<InstagramGraphStatus> {
  if (!isInstagramGraphConfigured()) {
    return {
      configured: false,
      connected: false,
      error:
        "INSTAGRAM_ACCESS_TOKEN Vercel ortam değişkenlerine eklenmemiş. Admin CMS ayarları yetmez; token sunucu env’de olmalı.",
    };
  }

  try {
    const profile = await fetchInstagramGraphProfile();
    return {
      configured: true,
      connected: true,
      username: profile.username,
      userId: profile.id,
      host: profile.host,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      error: error instanceof Error ? error.message : "Bağlantı kurulamadı.",
    };
  }
}
