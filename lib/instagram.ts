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

  return {
    enabled: partial.enabled === true,
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

export const getInstagramFeed = cache(async (): Promise<{
  settings: InstagramSettings;
  posts: ResolvedInstagramPost[];
}> => {
  const settings = await getInstagramSettings();

  if (!settings.enabled) {
    return { settings, posts: [] };
  }

  if (settings.source === "graph" && isInstagramGraphConfigured()) {
    try {
      const posts = await fetchInstagramGraphPosts(settings.postLimit);
      if (posts.length > 0) {
        return { settings, posts };
      }
    } catch {
      // Graph API başarısız olursa manuel gönderilere düş.
    }
  }

  return { settings, posts: resolveManualPosts(settings) };
});

export type {
  InstagramPost,
  InstagramSettings,
  InstagramSource,
} from "@/lib/instagram-defaults";
