import { createClient } from "@/lib/supabase/server";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export default async function AdminPortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: initialCategoryId = "" } = await searchParams;
  const supabase = await createClient();
  const [{ data: categories }, { data: images }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, title, parent_id, sort_order")
      .order("sort_order"),
    supabase
      .from("portfolio_images")
      .select(
        "id, caption, orientation, image_path, is_featured, sort_order, category_id, created_at, updated_at, categories(id, title, slug, parent_id)",
      )
      .order("updated_at", { ascending: false }),
  ]);

  const rows = categories ?? [];
  const byId = new Map(rows.map((c) => [c.id, c]));
  const tops = rows.filter((c) => !c.parent_id);

  const categoryOptions = tops.flatMap((top) => {
    const children = rows
      .filter((c) => c.parent_id === top.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    return [
      {
        id: top.id,
        slug: top.slug,
        title: top.title,
        label: top.title,
      },
      ...children.map((child) => ({
        id: child.id,
        slug: child.slug,
        title: child.title,
        label: `${top.title} → ${child.title}`,
      })),
    ];
  });

  for (const row of rows) {
    if (categoryOptions.some((o) => o.id === row.id)) continue;
    const parent = row.parent_id ? byId.get(row.parent_id) : null;
    categoryOptions.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
      label: parent ? `${parent.title} → ${row.title}` : row.title,
    });
  }

  const imageList = (images ?? []).map((image) => {
    const cat = image.categories as unknown as {
      id: string;
      title: string;
      slug: string;
      parent_id: string | null;
    } | null;
    const parent = cat?.parent_id ? byId.get(cat.parent_id) : null;
    const label = cat
      ? parent
        ? `${parent.title} → ${cat.title}`
        : cat.title
      : "Klasör yok";
    return {
      id: image.id,
      caption: image.caption,
      orientation: image.orientation,
      image_path: image.image_path,
      is_featured: image.is_featured,
      sort_order: image.sort_order,
      created_at: image.created_at,
      updated_at: image.updated_at,
      category_id: image.category_id,
      category_title: cat?.title ?? "",
      category_label: label,
    };
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Portfolyo Görselleri</h1>
      <p className="mt-2 text-sm text-mocha">
        Fotoğrafları yükleyin ve yönetin. Klasör kapakları{" "}
        <a
          href="/admin/kategoriler"
          className="underline underline-offset-2 hover:text-espresso"
        >
          Portfolyo Klasörleri
        </a>{" "}
        sayfasından seçilir; ★ yalnızca ana sayfa “öne çıkanlar” içindir.
      </p>
      <div className="mt-8">
        <PortfolioManager
          categories={categoryOptions}
          images={imageList}
          initialCategoryId={
            categoryOptions.some((c) => c.id === initialCategoryId)
              ? initialCategoryId
              : ""
          }
        />
      </div>
    </div>
  );
}
