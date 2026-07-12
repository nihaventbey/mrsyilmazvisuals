import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Placeholder } from "@/components/ui/Placeholder";
import { Button } from "@/components/ui/Button";
import {
  formatDate,
  getBlogPost,
  getBlogPosts,
} from "@/lib/content";

type Params = { slug: string };

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Yazı bulunamadı" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <article>
      <div className="container-page max-w-3xl pt-12">
        <Link
          href="/blog"
          className="text-sm text-mocha transition-colors hover:text-espresso"
        >
          ← Tüm yazılar
        </Link>

        <div className="mt-6 flex items-center gap-3 text-xs text-mist">
          <span className="font-medium uppercase tracking-[0.15em] text-gold-dark">
            {post.category}
          </span>
          <span>·</span>
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{post.readingTime} dk okuma</span>
        </div>

        <h1 className="mt-4 text-3xl leading-tight text-espresso sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mocha">
          {post.excerpt}
        </p>
      </div>

      <div className="container-page mt-10 max-w-4xl">
        <Placeholder
          index={2}
          label={post.category}
          className="aspect-[16/9] w-full"
        />
      </div>

      <div className="container-page mt-12 max-w-3xl pb-16">
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </div>

      <div className="border-t border-espresso/10 bg-sand/40 py-16">
        <div className="container-page text-center">
          <h2 className="text-2xl text-espresso">
            Sizin hikâyenizi anlatalım
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-mocha">
            Bu özel anları birlikte ölümsüzleştirmek için hemen rezervasyon
            oluşturabilirsiniz.
          </p>
          <Button href="/rezervasyon" size="lg" className="mt-6">
            Rezervasyon Oluştur
          </Button>
        </div>
      </div>
    </article>
  );
}
