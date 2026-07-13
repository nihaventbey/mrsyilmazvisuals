import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteGiveaway } from "@/app/admin/actions";
import { formatDate } from "@/lib/content";
import { Button } from "@/components/ui/Button";

export default async function AdminGiveawaysPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("giveaways")
    .select("id, title, slug, draw_date, published, created_at")
    .order("draw_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-espresso">Çekilişler</h1>
        <Button href="/admin/cekilis/yeni" size="sm">
          Yeni Çekiliş
        </Button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-espresso/10 bg-white/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs uppercase tracking-wider text-mist">
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <tr key={row.id} className="border-b border-espresso/5">
                <td className="px-4 py-3 text-espresso">{row.title}</td>
                <td className="px-4 py-3 text-mocha">
                  {formatDate(row.draw_date)}
                </td>
                <td className="px-4 py-3">
                  {row.published ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      Yayında
                    </span>
                  ) : (
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-mocha">
                      Taslak
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/cekilis/${row.id}`}
                      className="text-gold-dark hover:underline"
                    >
                      Düzenle
                    </Link>
                    <form action={deleteGiveaway}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="cursor-pointer text-red-700 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(rows ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-mist">
                  Henüz çekiliş yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
