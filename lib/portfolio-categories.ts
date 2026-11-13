import { cache } from "react";
import portfolioData from "@/content/portfolio.json";
import {
  createPublicClient,
  isSupabaseConfigured,
  storagePublicUrl,
} from "@/lib/supabase/public";
import type { PortfolioImage } from "@/lib/content";

export type CategoryRow = {
  id: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  sort_order: number;
  parent_id: string | null;
  cover_image_id: string | null;
};

export type PortfolioCategorySummary = {
  id?: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  parentSlug: string | null;
  href: string;
  coverImageUrl?: string | null;
};

export type PortfolioCategoryDetail = PortfolioCategorySummary & {
  images: PortfolioImage[];
  children: PortfolioCategorySummary[];
};

type RawPortfolioImage = {
  id: string;
  caption: string;
  orientation: string;
  image_path: string | null;
  is_featured?: boolean;
  sort_order?: number;
  category_id?: string;
};

function hrefFor(slug: string, parentSlug: string | null): string {
  return parentSlug
    ? `/portfolyo/${parentSlug}/${slug}`
    : `/portfolyo/${slug}`;
}

function mapImage(image: RawPortfolioImage): PortfolioImage {
  return {
    id: image.id,
    caption: image.caption,
    orientation: image.orientation as "portrait" | "landscape",
    imageUrl: storagePublicUrl("portfolio", image.image_path),
  };
}

function imageUrl(image: RawPortfolioImage | undefined): string | null {
  if (!image) return null;
  return storagePublicUrl("portfolio", image.image_path);
}

/** Explicit cover_image_id first; else featured; else first image with a URL. */
function pickCoverUrl(
  images: RawPortfolioImage[],
  coverImageId: string | null | undefined,
): string | null {
  if (coverImageId) {
    const explicit = images.find((image) => image.id === coverImageId);
    const url = imageUrl(explicit);
    if (url) return url;
  }

  const featured = images.find(
    (image) => image.is_featured && imageUrl(image),
  );
  if (featured) return imageUrl(featured);

  for (const image of images) {
    const url = imageUrl(image);
    if (url) return url;
  }
  return null;
}

/**
 * Parent folder cover: own explicit cover, else own fallback, else first child
 * with an explicit/fallback cover (child sort order).
 */
function pickFolderCoverUrl(
  own: RawPortfolioImage[],
  ownCoverId: string | null | undefined,
  childPools: Array<{
    images: RawPortfolioImage[];
    coverId: string | null | undefined;
  }>,
): string | null {
  const ownCover = pickCoverUrl(own, ownCoverId);
  if (ownCover) return ownCover;

  for (const child of childPools) {
    const url = pickCoverUrl(child.images, child.coverId);
    if (url) return url;
  }
  return null;
}

function orderImagesForGallery(images: RawPortfolioImage[]): PortfolioImage[] {
  return images.map(mapImage);
}

export const getCategoryRows = cache(async (): Promise<CategoryRow[]> => {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, slug, title, short, description, sort_order, parent_id, cover_image_id",
    )
    .order("sort_order");

  if (error || !data) return [];
  return data as CategoryRow[];
});

function buildSummaries(rows: CategoryRow[]): PortfolioCategorySummary[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return rows.map((row) => {
    const parent = row.parent_id ? byId.get(row.parent_id) : null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      short: row.short || row.title,
      description: row.description,
      parentSlug: parent?.slug ?? null,
      href: hrefFor(row.slug, parent?.slug ?? null),
    };
  });
}

/** Top-level categories for portfolio index + homepage services. */
export async function getTopLevelCategories(): Promise<
  Array<PortfolioCategorySummary & { images: PortfolioImage[]; childCount: number }>
> {
  if (!isSupabaseConfigured()) {
    return fallbackTopLevel();
  }

  const rows = await getCategoryRows();
  if (rows.length === 0) return fallbackTopLevel();

  const tops = rows.filter((r) => !r.parent_id);
  const summaries = buildSummaries(rows);
  const bySlug = new Map(summaries.map((s) => [s.slug, s]));

  const supabase = createPublicClient();
  const { data: images } = await supabase
    .from("portfolio_images")
    .select(
      "id, caption, orientation, image_path, sort_order, category_id, is_featured, created_at",
    )
    .order("sort_order")
    .order("created_at", { ascending: false })
    .order("id");

  const imagesByCategory = new Map<string, RawPortfolioImage[]>();
  for (const image of images ?? []) {
    const list = imagesByCategory.get(image.category_id) ?? [];
    list.push(image as RawPortfolioImage);
    imagesByCategory.set(image.category_id, list);
  }

  return tops.map((top) => {
    const summary = bySlug.get(top.slug)!;
    const children = rows
      .filter((r) => r.parent_id === top.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const childIds = children.map((r) => r.id);
    const own = imagesByCategory.get(top.id) ?? [];
    const childPools = children.map((child) => ({
      images: imagesByCategory.get(child.id) ?? [],
      coverId: child.cover_image_id,
    }));
    const coverUrl = pickFolderCoverUrl(own, top.cover_image_id, childPools);
    const flat = [own, ...childPools.map((p) => p.images)].flat();
    const coverRaw = coverUrl
      ? flat.find((image) => imageUrl(image) === coverUrl)
      : undefined;
    const restPool =
      own.length > 0
        ? own
        : (childPools.find((pool) => pool.images.length > 0)?.images ?? []);
    const rest = orderImagesForGallery(
      restPool.filter((image) => image.id !== coverRaw?.id),
    );
    const gallery = coverRaw
      ? [mapImage(coverRaw), ...rest]
      : orderImagesForGallery(restPool);

    return {
      ...summary,
      coverImageUrl: coverUrl,
      images: gallery,
      childCount: childIds.length,
    };
  });
}

export async function getPortfolioCategoryBySlug(
  slug: string,
): Promise<PortfolioCategoryDetail | undefined> {
  if (!isSupabaseConfigured()) {
    return fallbackCategory(slug);
  }

  const rows = await getCategoryRows();
  const row = rows.find((r) => r.slug === slug);
  if (!row) return undefined;

  const summaries = buildSummaries(rows);
  const summary = summaries.find((s) => s.slug === slug)!;
  const childRows = rows
    .filter((r) => r.parent_id === row.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const childrenBase = summaries.filter((s) => s.parentSlug === slug);

  const supabase = createPublicClient();
  const categoryIds = [row.id, ...childRows.map((r) => r.id)];
  const { data: images } = await supabase
    .from("portfolio_images")
    .select(
      "id, caption, orientation, image_path, sort_order, category_id, is_featured, created_at",
    )
    .in("category_id", categoryIds)
    .order("sort_order")
    .order("created_at", { ascending: false })
    .order("id");

  const imagesByCategory = new Map<string, RawPortfolioImage[]>();
  for (const image of images ?? []) {
    const list = imagesByCategory.get(image.category_id) ?? [];
    list.push(image as RawPortfolioImage);
    imagesByCategory.set(image.category_id, list);
  }

  const own = imagesByCategory.get(row.id) ?? [];
  const children = childrenBase.map((child) => {
    const childRow = childRows.find((r) => r.slug === child.slug);
    const childImages = childRow
      ? (imagesByCategory.get(childRow.id) ?? [])
      : [];
    return {
      ...child,
      coverImageUrl: pickCoverUrl(childImages, childRow?.cover_image_id),
    };
  });

  const childPools = childRows.map((child) => ({
    images: imagesByCategory.get(child.id) ?? [],
    coverId: child.cover_image_id,
  }));

  return {
    ...summary,
    coverImageUrl: pickFolderCoverUrl(own, row.cover_image_id, childPools),
    children,
    images: orderImagesForGallery(own),
  };
}

export async function getPortfolioSubcategory(
  parentSlug: string,
  childSlug: string,
): Promise<PortfolioCategoryDetail | undefined> {
  const parent = await getPortfolioCategoryBySlug(parentSlug);
  if (!parent || parent.parentSlug) return undefined;

  const child = await getPortfolioCategoryBySlug(childSlug);
  if (!child || child.parentSlug !== parentSlug) return undefined;
  return child;
}

/** Leaf categories (no children) — used for booking form options. */
export async function getBookableCategories(): Promise<
  Array<{ slug: string; title: string }>
> {
  if (!isSupabaseConfigured()) {
    return [
      { slug: "bebek", title: "Bebek & Yenidoğan Çekimleri" },
      { slug: "dogum", title: "Doğum Fotoğrafçılığı" },
      { slug: "dugun", title: "Düğün Çekimleri" },
      { slug: "etkinlik", title: "Etkinlik" },
    ];
  }

  const rows = await getCategoryRows();
  if (rows.length === 0) {
    return [
      { slug: "bebek", title: "Bebek & Yenidoğan Çekimleri" },
      { slug: "dogum", title: "Doğum Fotoğrafçılığı" },
      { slug: "dugun", title: "Düğün Çekimleri" },
      { slug: "etkinlik", title: "Etkinlik" },
    ];
  }

  const parentIds = new Set(
    rows.map((r) => r.parent_id).filter((id): id is string => Boolean(id)),
  );

  return rows
    .filter((r) => !parentIds.has(r.id))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => ({ slug: r.slug, title: r.title }));
}

export async function getBookableCategorySlugs(): Promise<string[]> {
  const cats = await getBookableCategories();
  return cats.map((c) => c.slug);
}

/** Flat list with display labels for admin selects (parents indented). */
export async function getCategoryOptionsForAdmin(): Promise<
  Array<{ id: string; slug: string; title: string; label: string; parent_id: string | null }>
> {
  const rows = await getCategoryRows();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const tops = rows.filter((r) => !r.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  const options: Array<{
    id: string;
    slug: string;
    title: string;
    label: string;
    parent_id: string | null;
  }> = [];

  for (const top of tops) {
    options.push({
      id: top.id,
      slug: top.slug,
      title: top.title,
      label: top.title,
      parent_id: null,
    });
    const children = rows
      .filter((r) => r.parent_id === top.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    for (const child of children) {
      options.push({
        id: child.id,
        slug: child.slug,
        title: child.title,
        label: `${top.title} → ${child.title}`,
        parent_id: child.parent_id,
      });
    }
  }

  for (const row of rows) {
    if (options.some((o) => o.id === row.id)) continue;
    const parent = row.parent_id ? byId.get(row.parent_id) : null;
    options.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
      label: parent ? `${parent.title} → ${row.title}` : row.title,
      parent_id: row.parent_id,
    });
  }

  return options;
}

function fallbackTopLevel(): Array<
  PortfolioCategorySummary & { images: PortfolioImage[]; childCount: number }
> {
  return portfolioData.categories.map((category) => ({
    slug: category.slug,
    title: category.title,
    short: category.title,
    description: category.description,
    parentSlug: null,
    href: `/portfolyo/${category.slug}`,
    childCount: 0,
    images: category.images.map((image) => ({
      id: image.id,
      caption: image.caption,
      orientation: image.orientation as "portrait" | "landscape",
      imageUrl: null,
    })),
  }));
}

function fallbackCategory(slug: string): PortfolioCategoryDetail | undefined {
  const category = portfolioData.categories.find((c) => c.slug === slug);
  if (!category) return undefined;
  return {
    slug: category.slug,
    title: category.title,
    short: category.title,
    description: category.description,
    parentSlug: null,
    href: `/portfolyo/${category.slug}`,
    children: [],
    images: category.images.map((image) => ({
      id: image.id,
      caption: image.caption,
      orientation: image.orientation as "portrait" | "landscape",
      imageUrl: null,
    })),
  };
}

export function slugifyCategory(raw: string): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "kategori";
}
