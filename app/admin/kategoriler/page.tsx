import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, title, short, description, sort_order")
    .order("sort_order");

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Kategoriler</h1>
      <p className="mt-2 text-sm text-mocha">
        Portfolyo kategorileri ve ana sayfadaki hizmet kartları buradan
        yönetilir.
      </p>

      <div className="mt-8 space-y-6">
        {(categories ?? []).map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-espresso/10 bg-white/50 p-6"
          >
            <CategoryForm category={category} />
          </div>
        ))}
      </div>
    </div>
  );
}
