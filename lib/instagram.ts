import { cache } from "react";
import {
  fetchInstagramGraphPosts,
  isInstagramGraphConfigured,
} from "@/lib/instagram-graph";
import {
  defaultInstagramSettings,
  type InstagramPost,
  type InstagramSettings,
} from "@/lib/instagram-defaults";
import {
  createPublicClient,
  isSupabaseConfigured,
  storagePublicUrl,
} from "@/lib/supabase/public";

export type ResolvedInstagramPost = InstagramPost & {
  imageUrl: string | null;
};

export type InstagramFeedResult = {
  settings: InstagramSettings;
  posts: ResolvedInstagramPost[];
  /** Why posts are empty when the section is enabled (dev / admin hint). */
  emptyReason?: string;
};

function normalizePost(value: unknown, index: number): InstagramPost | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<InstagramPost>;
  const url = String(row.url ?? "").trim();
  if (!url) return null;

  return {
    id: String(row.id ?? `instagram-${index}`),
    image: String(row.image ?? ""),
    url,
    enabled: row.enabled !== false,
  };
}

function mergeInstagramSettings(value: unknown): InstagramSettings {
  if (!value || typeof value !== "object") return defaultInstagramSettings;
  const partial = value as Partial<InstagramSettings>;
  const posts = Array.isArray(partial.posts)
    ? partial.posts
        .map((post, index) => normalizePost(post, index))
        .filter((post): post is InstagramPost => post !== null)
    : [];

  const postLimit = Number(partial.postLimit);
  const source = partial.source === "manual" ? "manual" : "graph";

  const rawEnabled = (partial as { enabled?: unknown }).enabled;
  const enabled = rawEnabled === true || rawEnabled === "true";

  return {
    enabled,
    source,
    postLimit: Number.isFinite(postLimit)
      ? Math.min(12, Math.max(3, postLimit))
      : defaultInstagramSettings.postLimit,
    eyebrow: String(partial.eyebrow ?? defaultInstagramSettings.eyebrow),
    title: String(partial.title ?? defaultInstagramSettings.title),
    posts,
  };
}

function resolveImage(path: string): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return storagePublicUrl("site", path);
}

function resolveManualPosts(settings: InstagramSettings): ResolvedInstagramPost[] {
  return settings.posts
    .filter((post) => post.enabled)
    .map((post) => ({
      ...post,
      imageUrl: resolveImage(post.image),
    }))
    .filter((post) => post.imageUrl);
}

export const getInstagramSettings = cache(async (): Promise<InstagramSettings> => {
  if (!isSupabaseConfigured()) return defaultInstagramSettings;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "instagram")
    .maybeSingle();

  return mergeInstagramSettings(data?.value);
});

export const getInstagramFeed = cache(async (): Promise<InstagramFeedResult> => {
  const settings = await getInstagramSettings();

  if (!settings.enabled) {
    return { settings, posts: [] };
  }

  if (settings.source === "graph") {
    if (!isInstagramGraphConfigured()) {
      const emptyReason =
        "INSTAGRAM_ACCESS_TOKEN bu ortamda yok. Vercel’deki token’ı .env.local dosyasına ekleyip `npm run dev` sürecini yeniden başlatın.";
      console.error(`[instagram] ${emptyReason}`);
      const manual = resolveManualPosts(settings);
      return {
        settings,
        posts: manual,
        emptyReason: manual.length ? undefined : emptyReason,
      };
    }

    try {
      const posts = await fetchInstagramGraphPosts(settings.postLimit);
      if (posts.length > 0) {
        return { settings, posts };
      }
      const manual = resolveManualPosts(settings);
      return {
        settings,
        posts: manual,
        emptyReason:
          manual.length > 0
            ? undefined
            : "Graph API yanıt verdi ama gönderi dönmedi. INSTAGRAM_USER_ID doğru mu, hesapta medya var mı kontrol edin.",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[instagram] Graph feed failed:", message);
      const manual = resolveManualPosts(settings);
      return {
        settings,
        posts: manual,
        emptyReason:
          manual.length > 0
            ? undefined
            : `Graph API hatası: ${message}`,
      };
    }
  }

  const manual = resolveManualPosts(settings);
  return {
    settings,
    posts: manual,
    emptyReason:
      manual.length > 0
        ? undefined
        : "Manuel kaynak seçili ama yayınlanabilir gönderi yok.",
  };
});

export type {
  InstagramPost,
  InstagramSettings,
  InstagramSource,
} from "@/lib/instagram-defaults";
