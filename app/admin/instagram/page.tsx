import { InstagramFeedManager } from "@/components/admin/InstagramFeedManager";
import { getInstagramGraphStatus } from "@/lib/instagram-graph";
import { getInstagramSettings } from "@/lib/instagram";
import { storagePublicUrl } from "@/lib/supabase/public";
import type { InstagramPost } from "@/lib/instagram";

function withPreview(post: InstagramPost) {
  const previewUrl =
    post.image && !post.image.startsWith("/") && !post.image.startsWith("http")
      ? storagePublicUrl("site", post.image) ?? undefined
      : post.image || undefined;

  return { ...post, previewUrl };
}

export default async function AdminInstagramPage() {
  const [settings, graphStatus] = await Promise.all([
    getInstagramSettings(),
    getInstagramGraphStatus(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Instagram Akışı</h1>
      <div className="mt-8">
        <InstagramFeedManager
          initialSettings={settings}
          initialPosts={settings.posts.map(withPreview)}
          graphStatus={graphStatus}
        />
      </div>
    </div>
  );
}
