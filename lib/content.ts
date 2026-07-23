import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import portfolioData from "@/content/portfolio.json";
import faqData from "@/content/faq.json";
import {
  createPublicClient,
  isSupabaseConfigured,
  storagePublicUrl,
} from "@/lib/supabase/public";

export type PortfolioImage = {
  id: string;
  caption: string;
  orientation: "portrait" | "landscape";
  imageUrl: string | null;
};

export type PortfolioCategory = {
  slug: string;
  title: string;
  short: string;
  description: string;
  parentSlug: string | null;
  href: string;
  children?: Array<{
    slug: string;
    title: string;
    short: string;
    description: string;
    href: string;
  }>;
  images: PortfolioImage[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type BlogMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readingTime: number;
};

export type BlogPost = BlogMeta & {
  html: string;
};

function readingTimeOf(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ============================== portfolio ==============================

export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
  const { getTopLevelCategories } = await import("@/lib/portfolio-categories");
  const tops = await getTopLevelCategories();
  return tops.map((category) => ({
    slug: category.slug,
    title: category.title,
    short: category.short,
    description: category.description,
    parentSlug: category.parentSlug,
    href: category.href,
    images: category.images,
  }));
}

export async function getPortfolioCategory(
  slug: string,
): Promise<PortfolioCategory | undefined> {
  const {
    getPortfolioCategoryBySlug,
  } = await import("@/lib/portfolio-categories");
  const category = await getPortfolioCategoryBySlug(slug);
  if (!category) return undefined;
  return {
    slug: category.slug,
    title: category.title,
    short: category.short,
    description: category.description,
    parentSlug: category.parentSlug,
    href: category.href,
    images: category.images,
    children: category.children.map((child) => ({
      slug: child.slug,
      title: child.title,
      short: child.short,
      description: child.description,
      href: child.href,
    })),
  };
}

export async function getFeaturedImages(): Promise<
  Array<PortfolioImage & { categorySlug: string }>
> {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("portfolio_images")
      .select("id, caption, orientation, image_path, categories(slug)")
      .eq("is_featured", true)
      .order("sort_order")
      .limit(8);

    if (!error && data && data.length > 0) {
      return data.map((image) => ({
        id: image.id,
        caption: image.caption,
        orientation: image.orientation as "portrait" | "landscape",
        imageUrl: storagePublicUrl("portfolio", image.image_path),
        categorySlug:
          (image.categories as unknown as { slug: string } | null)?.slug ?? "",
      }));
    }
  }

  const categories = await getPortfolioCategories();
  return categories.flatMap((category) =>
    category.images
      .slice(0, 2)
      .map((image) => ({ ...image, categorySlug: category.slug })),
  );
}

function fallbackCategories(): PortfolioCategory[] {
  return portfolioData.categories.map((category) => ({
    slug: category.slug,
    title: category.title,
    short: category.title,
    description: category.description,
    parentSlug: null,
    href: `/portfolyo/${category.slug}`,
    images: category.images.map((image) => ({
      id: image.id,
      caption: image.caption,
      orientation: image.orientation as "portrait" | "landscape",
      imageUrl: null,
    })),
  }));
}

// ================================ faq ==================================

export async function getFaq(): Promise<FaqItem[]> {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("faq_items")
      .select("question, answer")
      .order("sort_order");

    if (!error && data && data.length > 0) return data as FaqItem[];
  }

  return faqData as FaqItem[];
}

// ================================ blog =================================

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export async function getBlogPosts(): Promise<BlogMeta[]> {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, category, content, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        date: post.published_at ?? "",
        readingTime: readingTimeOf(post.content),
      }));
    }
  }

  return fallbackBlogPosts();
}

export async function getBlogPost(
  slug: string,
): Promise<BlogPost | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, category, content, published_at")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        category: data.category,
        date: data.published_at ?? "",
        readingTime: readingTimeOf(data.content),
        html: await marked.parse(data.content),
      };
    }
  }

  return fallbackBlogPost(slug);
}

function readBlogFile(fileName: string) {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ""),
    date: String(data.date ?? ""),
    category: String(data.category ?? "Genel"),
    readingTime: readingTimeOf(content),
    content,
  };
}

function fallbackBlogPosts(): BlogMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { content: _content, ...meta } = readBlogFile(file);
      return meta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function fallbackBlogPost(slug: string): Promise<BlogPost | undefined> {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(BLOG_DIR, file))) return undefined;
  const { content, ...meta } = readBlogFile(file);
  return { ...meta, html: await marked.parse(content) };
}

// ================================ misc =================================

export function formatDate(date: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
