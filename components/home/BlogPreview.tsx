import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogPosts } from "@/lib/content";

export async function BlogPreview() {
  const posts = (await getBlogPosts()).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="container-page py-20">
      <SectionHeading
        eyebrow="Blog"
        title="İlham ve rehber yazılar"
        description="Çekim öncesi hazırlıktan konsept fikirlerine, deneyimlerimi ve önerilerimi sizinle paylaşıyorum."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <BlogCard key={post.slug} post={post} index={i} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button href="/blog" variant="outline" size="lg">
          Tüm Yazıları Gör
        </Button>
      </div>
    </section>
  );
}
