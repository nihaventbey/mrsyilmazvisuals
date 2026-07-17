import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { isGeminiConfigured } from "@/lib/gemini";

export const maxDuration = 60;

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, category, published")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Yazıyı Düzenle</h1>
      <div className="mt-8">
        <BlogPostForm
          post={post}
          geminiConfigured={isGeminiConfigured()}
        />
      </div>
    </div>
  );
}
