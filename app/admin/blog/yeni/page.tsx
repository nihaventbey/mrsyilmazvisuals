import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Yeni Yazı</h1>
      <div className="mt-8">
        <BlogPostForm />
      </div>
    </div>
  );
}
