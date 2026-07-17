import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { isGeminiConfigured } from "@/lib/gemini";

export const maxDuration = 60;

export default function NewBlogPostPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Yeni Yazı</h1>
      <div className="mt-8">
        <BlogPostForm geminiConfigured={isGeminiConfigured()} />
      </div>
    </div>
  );
}
