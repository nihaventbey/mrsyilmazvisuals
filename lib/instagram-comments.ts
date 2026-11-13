import { normalizeInstagramUsername } from "@/lib/giveaways";

export type InstagramCommentItem = {
  id: string;
  username: string;
  commentText: string;
  mentionsCount: number;
  createdAt?: string;
};

/**
 * Extracts Instagram shortcode from a post URL.
 * E.g. https://www.instagram.com/p/Dau7FF8laPn/ -> Dau7FF8laPn
 */
export function extractInstagramShortcode(urlOrCode: string): string {
  const clean = urlOrCode.trim();
  const match = clean.match(/(?:instagram\.com\/(?:p|reel|tv)\/|instagr\.am\/p\/)([\w-]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]+$/.test(clean)) {
    return clean;
  }
  return clean;
}

/**
 * Parses raw text from Instagram web copy-paste or comment exports
 */
export function parseRawInstagramComments(rawText: string): InstagramCommentItem[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: InstagramCommentItem[] = [];

  const noiseRegex = /^(yanıtla|beğen|yanıtları gör|yanıtı gör|\d+\s*(s|dk|saat|gün|hafta)|görüntüle|gönder|paylaş)$/i;

  let currentUsername = "";
  let currentComment = "";

  lines.forEach((line, idx) => {
    if (noiseRegex.test(line)) return;

    const userMatch = line.match(/^@?([a-zA-Z0-9._]{3,30})\b/);

    if (userMatch && (!currentUsername || line.includes(" ") === false)) {
      const candidate = normalizeInstagramUsername(userMatch[1]);
      if (candidate.length >= 3 && !noiseRegex.test(candidate)) {
        if (currentUsername) {
          const mentions = (currentComment.match(/@[a-zA-Z0-9._]{3,30}/g) || []).length;
          items.push({
            id: `parse-${idx}-${currentUsername}`,
            username: currentUsername,
            commentText: currentComment || `@${currentUsername}`,
            mentionsCount: mentions,
          });
        }
        currentUsername = candidate;
        currentComment = line;
        return;
      }
    }

    if (currentUsername) {
      currentComment += ` ${line}`;
    } else {
      const mentions = line.match(/@[a-zA-Z0-9._]{3,30}/g) || [];
      mentions.forEach((m, mIdx) => {
        const uname = normalizeInstagramUsername(m);
        if (uname) {
          items.push({
            id: `parse-m-${idx}-${mIdx}`,
            username: uname,
            commentText: line,
            mentionsCount: mentions.length - 1,
          });
        }
      });
    }
  });

  if (currentUsername) {
    const mentions = (currentComment.match(/@[a-zA-Z0-9._]{3,30}/g) || []).length;
    items.push({
      id: `parse-final-${currentUsername}`,
      username: currentUsername,
      commentText: currentComment,
      mentionsCount: mentions,
    });
  }

  if (items.length === 0) {
    lines.forEach((l, i) => {
      const handles = l.match(/@?([a-zA-Z0-9._]{3,30})/g) || [];
      handles.forEach((h, hIdx) => {
        const cleanU = normalizeInstagramUsername(h);
        if (cleanU && !noiseRegex.test(cleanU)) {
          items.push({
            id: `fallback-${i}-${hIdx}`,
            username: cleanU,
            commentText: l,
            mentionsCount: (l.match(/@[a-zA-Z0-9._]{3,30}/g) || []).length,
          });
        }
      });
    });
  }

  return items;
}

/**
 * Fetches all comments for a media post using Meta Graph API (paginated)
 */
export async function fetchInstagramCommentsFromGraphApi(shortcode: string): Promise<InstagramCommentItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) return [];

  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const hosts = ["https://graph.instagram.com", "https://graph.facebook.com/v19.0"];

  let mediaId: string | null = null;

  // Step 1: Find media_id for the given shortcode permalink
  for (const host of hosts) {
    try {
      const mediaPath = userId ? `/${userId}/media` : "/me/media";
      const url = `${host}${mediaPath}?fields=id,permalink,caption&limit=50&access_token=${token}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const items = json.data || [];
        const match = items.find(
          (item: { permalink?: string; id?: string }) =>
            item.permalink?.includes(shortcode) || item.id === shortcode,
        );
        if (match?.id) {
          mediaId = match.id;
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  if (!mediaId) {
    mediaId = shortcode;
  }

  // Step 2: Fetch all comment pages
  const allComments: InstagramCommentItem[] = [];

  for (const host of hosts) {
    let currentUrl: string | null = `${host}/${mediaId}/comments?fields=id,text,username,timestamp&limit=100&access_token=${token}`;
    try {
      while (currentUrl) {
        const fetchRes: Response = await fetch(currentUrl, { cache: "no-store" });
        if (!fetchRes.ok) break;
        const fetchJson: { data?: Array<{ id?: string; username?: string; text?: string; timestamp?: string }>; paging?: { next?: string } } = await fetchRes.json();
        const data = fetchJson.data || [];

        for (const item of data) {
          const uname = item.username ? normalizeInstagramUsername(item.username) : "kullanici";
          const text = item.text || "";
          const mentions = (text.match(/@[a-zA-Z0-9._]{3,30}/g) || []).length;
          allComments.push({
            id: item.id || `graph-${allComments.length}`,
            username: uname,
            commentText: text,
            mentionsCount: mentions,
            createdAt: item.timestamp,
          });
        }

        const nextUrl = fetchJson.paging?.next || null;
        if (nextUrl) {
          try {
            const parsedNext = new URL(nextUrl);
            const allowedHosts = new Set([
              "graph.instagram.com",
              "graph.facebook.com",
            ]);
            currentUrl =
              parsedNext.protocol === "https:" &&
              allowedHosts.has(parsedNext.hostname)
                ? nextUrl
                : null;
          } catch {
            currentUrl = null;
          }
        } else {
          currentUrl = null;
        }
      }

      if (allComments.length > 0) {
        return allComments;
      }
    } catch {
      // ignore
    }
  }

  return allComments;
}

/**
 * Main comment fetcher entry point.
 * Graph API token usage is gated behind allowGraphApi so unauthenticated callers cannot exhaust server quota.
 */
export async function fetchInstagramCommentsFromUrl(
  postUrlOrShortcode: string,
  options?: { allowGraphApi?: boolean },
): Promise<{
  success: boolean;
  shortcode: string;
  postUrl: string;
  comments: InstagramCommentItem[];
  source: "api" | "public_web" | "none";
  message?: string;
}> {
  const shortcode = extractInstagramShortcode(postUrlOrShortcode);
  const postUrl = `https://www.instagram.com/p/${shortcode}/`;

  if (!shortcode || !/^[\w-]+$/.test(shortcode)) {
    return {
      success: false,
      shortcode: "",
      postUrl: "",
      comments: [],
      source: "none",
      message: "Geçersiz Instagram gönderi linki.",
    };
  }

  // 1. Official Meta Graph API fetch using server environment token (admin only)
  if (options?.allowGraphApi && process.env.INSTAGRAM_ACCESS_TOKEN?.trim()) {
    try {
      const graphComments = await fetchInstagramCommentsFromGraphApi(shortcode);
      if (graphComments.length > 0) {
        return {
          success: true,
          shortcode,
          postUrl,
          comments: graphComments,
          source: "api",
          message: `Official Instagram Graph API üzerinden ${graphComments.length} adet GERÇEK yorum başarıyla çekildi.`,
        };
      }
    } catch {
      // fallback
    }
  }

  // 2. Try public Instagram GraphQL query endpoint
  try {
    const graphqlUrl = `https://www.instagram.com/graphql/query/?query_hash=b5a470b2604892f6a61858f0012e1f59&variables=${encodeURIComponent(
      JSON.stringify({ shortcode, first: 50 }),
    )}`;

    const res = await fetch(graphqlUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      const edges = json?.data?.shortcode_media?.edge_media_to_parent_comment?.edges;

      if (Array.isArray(edges) && edges.length > 0) {
        const comments: InstagramCommentItem[] = edges.map((edge: { node: { id: string; owner: { username: string }; text: string; created_at?: number } }) => {
          const uname = normalizeInstagramUsername(edge.node.owner?.username || "");
          const text = edge.node.text || "";
          return {
            id: edge.node.id,
            username: uname,
            commentText: text,
            mentionsCount: (text.match(/@[a-zA-Z0-9._]{3,30}/g) || []).length,
            createdAt: edge.node.created_at ? new Date(edge.node.created_at * 1000).toISOString() : undefined,
          };
        });

        return {
          success: true,
          shortcode,
          postUrl,
          comments,
          source: "public_web",
          message: `Instagram web GraphQL sunucusundan ${comments.length} adet GERÇEK yorum çekildi.`,
        };
      }
    }
  } catch {
    // Continue
  }

  return {
    success: false,
    shortcode,
    postUrl,
    comments: [],
    source: "none",
    message: `Instagram (${shortcode}) gönderisi için sunucu API erişimi tanımlı token gerektirmektedir. Sayfadaki 1-Tıkla Gerçek Yorum Çekme aracını kullanabilirsiniz.`,
  };
}
