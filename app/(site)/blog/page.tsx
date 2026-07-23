import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BlogCard } from "@/components/blog/BlogCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { getBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Bebek, doğum, düğün ve etkinlik çekimleri üzerine ilham veren rehberler, ipuçları ve deneyimler.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="İlham & Rehber"
        description="Çekim hazırlığından konsept fikirlerine, deneyimlerimi ve önerilerimi sizinle paylaşıyorum."
      />

      <AdSlot slot="blogIndex" className="-mt-4 sm:-mt-6" />

      <section className="container-page py-20">
        {posts.length === 0 ? (
          <p className="text-center text-mocha">
            Yakında yeni yazılar burada olacak.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
