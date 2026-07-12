import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteBlogPost } from "@/app/admin/actions";
import { formatDate } from "@/lib/content";
import { Button } from "@/components/ui/Button";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, category, published, published_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-espresso">Blog</h1>
        <Button href="/admin/blog/yeni" size="sm">
          Yeni Yazı
        </Button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-espresso/10 bg-white/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs uppercase tracking-wider text-mist">
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {(posts ?? []).map((post) => (
              <tr key={post.id} className="border-b border-espresso/5">
                <td className="px-4 py-3 text-espresso">{post.title}</td>
                <td className="px-4 py-3 text-mocha">{post.category}</td>
                <td className="px-4 py-3">
                  {post.published ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      Yayında
                    </span>
                  ) : (
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-mocha">
                      Taslak
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-mocha">
                  {formatDate(post.published_at ?? post.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-gold-dark hover:underline"
                    >
                      Düzenle
                    </Link>
                    <form action={deleteBlogPost}>
                      <input type="hidden" name="id" value={post.id} />
                      <button
                        type="submit"
                        className="text-red-700 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(posts ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-mist">
                  Henüz yazı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
