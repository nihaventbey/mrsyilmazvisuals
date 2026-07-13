import type { ResolvedInstagramPost } from "@/lib/instagram";

const GRAPH = "https://graph.instagram.com";
const FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

type GraphMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
};

type GraphMediaResponse = {
  data?: GraphMedia[];
  error?: { message: string; code?: number };
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
  error?: string;
};

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

function mediaEndpoint(): string {
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  return userId ? `${GRAPH}/${userId}/media` : `${GRAPH}/me/media`;
}

async function graphFetch<T>(url: URL): Promise<T> {
  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  const body = (await res.json()) as T & { error?: { message: string } };

  if (!res.ok || body.error) {
    throw new Error(body.error?.message ?? `Instagram API hatası (${res.status})`);
  }

  return body;
}

function toFeedPost(item: GraphMedia): ResolvedInstagramPost | null {
  const imageUrl =
    item.media_type === "VIDEO"
      ? item.thumbnail_url ?? null
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
}> {
  const url = new URL(`${GRAPH}/me`);
  url.searchParams.set("fields", "id,username");
  url.searchParams.set("access_token", accessToken());

  const body = await graphFetch<GraphProfileResponse>(url);
  if (!body.id || !body.username) {
    throw new Error("Instagram profil bilgisi alınamadı.");
  }

  return { id: body.id, username: body.username };
}

export async function fetchInstagramGraphPosts(
  limit: number,
): Promise<ResolvedInstagramPost[]> {
  const url = new URL(mediaEndpoint());
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 25)));
  url.searchParams.set("access_token", accessToken());

  const body = await graphFetch<GraphMediaResponse>(url);
  const posts = (body.data ?? [])
    .map(toFeedPost)
    .filter((post): post is ResolvedInstagramPost => post !== null);

  return posts.slice(0, limit);
}

export async function getInstagramGraphStatus(): Promise<InstagramGraphStatus> {
  if (!isInstagramGraphConfigured()) {
    return {
      configured: false,
      connected: false,
      error: "INSTAGRAM_ACCESS_TOKEN Vercel ortam değişkenlerine eklenmemiş.",
    };
  }

  try {
    const profile = await fetchInstagramGraphProfile();
    return {
      configured: true,
      connected: true,
      username: profile.username,
      userId: profile.id,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      error: error instanceof Error ? error.message : "Bağlantı kurulamadı.",
    };
  }
}
