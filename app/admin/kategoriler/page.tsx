import { createClient } from "@/lib/supabase/server";
import {
  CategoryForm,
  CreateCategoryForm,
} from "@/components/admin/CategoryForm";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, title, short, description, sort_order, parent_id")
    .order("sort_order");

  const rows = categories ?? [];
  const tops = rows.filter((c) => !c.parent_id);
  const parents = tops.map((c) => ({ id: c.id, title: c.title }));

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Kategoriler</h1>
      <p className="mt-2 text-sm text-mocha">
        Üst kategoriler ve alt kategoriler (ör. Etkinlik → Konser). Kısa etiket
        kartlarda alt metin olarak görünür.
      </p>

      <div className="mt-8 rounded-2xl border border-espresso/10 bg-white/50 p-6">
        <h2 className="font-serif text-xl text-espresso">Yeni kategori</h2>
        <div className="mt-4">
          <CreateCategoryForm parents={parents} />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {tops.map((top) => {
          const children = rows.filter((c) => c.parent_id === top.id);
          return (
            <div key={top.id} className="space-y-4">
              <div className="rounded-2xl border border-espresso/10 bg-white/50 p-6">
                <CategoryForm category={top} parents={parents} />
              </div>
              {children.map((child) => (
                <div
                  key={child.id}
                  className="ml-4 rounded-2xl border border-dashed border-espresso/15 bg-white/40 p-6 sm:ml-8"
                >
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-gold-dark">
                    Alt kategori · {top.title}
                  </p>
                  <CategoryForm category={child} parents={parents} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
