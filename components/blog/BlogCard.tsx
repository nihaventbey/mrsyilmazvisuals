import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { formatDate, type BlogMeta } from "@/lib/content";

export function BlogCard({ post, index }: { post: BlogMeta; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-espresso/10 bg-white/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <Placeholder
        index={index}
        label={post.category}
        rounded={false}
        className="aspect-[16/10]"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-mist">
          <span className="font-medium uppercase tracking-[0.15em] text-gold-dark">
            {post.category}
          </span>
          <span>·</span>
          <span>{post.readingTime} dk okuma</span>
        </div>
        <h3 className="mt-3 text-xl leading-snug text-espresso transition-colors group-hover:text-gold-dark">
          {post.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-mocha">
          {post.excerpt}
        </p>
        <span className="mt-4 text-xs text-mist">{formatDate(post.date)}</span>
      </div>
    </Link>
  );
}
