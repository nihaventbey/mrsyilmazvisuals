import { createClient } from "@/lib/supabase/server";
import { deleteFaq } from "@/app/admin/actions";
import { FaqForm } from "@/components/admin/FaqForm";

export default async function AdminFaqPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("faq_items")
    .select("id, question, answer, sort_order")
    .order("sort_order");

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">
        Sık Sorulan Sorular
      </h1>

      <div className="mt-8 rounded-2xl border border-espresso/10 bg-white/50 p-6">
        <h2 className="font-serif text-lg text-espresso">Yeni Soru</h2>
        <div className="mt-4">
          <FaqForm />
        </div>
      </div>

      <div className="mt-10 space-y-6">
        {(items ?? []).map((faq) => (
          <div
            key={faq.id}
            className="rounded-2xl border border-espresso/10 bg-white/50 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-espresso">{faq.question}</p>
              <form action={deleteFaq}>
                <input type="hidden" name="id" value={faq.id} />
                <button
                  type="submit"
                  className="text-sm text-red-700 hover:text-red-900"
                >
                  Sil
                </button>
              </form>
            </div>
            <div className="mt-4">
              <FaqForm faq={faq} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
