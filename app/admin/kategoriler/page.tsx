import { createClient } from "@/lib/supabase/server";
import { CategoryTreeManager } from "@/components/admin/CategoryTreeManager";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: images }] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "id, slug, title, short, description, sort_order, parent_id, cover_image_id",
      )
      .order("sort_order"),
    supabase
      .from("portfolio_images")
      .select("id, caption, image_path, category_id, sort_order")
      .not("image_path", "is", null)
      .order("sort_order")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Portfolyo Klasörleri</h1>
      <p className="mt-2 text-sm text-mocha">
        Üst ve alt klasörleri yönetin; her düzey için kapak görseli seçin.
      </p>
      <div className="mt-8">
        <CategoryTreeManager
          categories={categories ?? []}
          images={images ?? []}
        />
      </div>
    </div>
  );
}
