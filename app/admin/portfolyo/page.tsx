import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { storagePublicUrl } from "@/lib/supabase/public";
import {
  deletePlaceholderImages,
  deletePortfolioImage,
  toggleFeatured,
} from "@/app/admin/actions";
import { PortfolioUploader } from "@/components/admin/PortfolioUploader";
import { PortfolioImageEditForm } from "@/components/admin/PortfolioImageEditForm";

export default async function AdminPortfolioPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select(
      "id, slug, title, portfolio_images(id, caption, orientation, image_path, is_featured, sort_order)",
    )
    .order("sort_order")
    .order("sort_order", { referencedTable: "portfolio_images" });

  const categoryList = (categories ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
  }));

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Portfolyo</h1>
      <p className="mt-2 text-sm text-mocha">
        Çekimlerinizi bilgisayarınızdan yükleyin. Instagram entegrasyonu yok;
        fotoğrafları doğrudan buradan ekleyin.
      </p>

      <div className="mt-8">
        <PortfolioUploader categories={categoryList} />
      </div>

      <form action={deletePlaceholderImages} className="mt-4">
        <button
          type="submit"
          className="text-sm text-red-700 underline-offset-4 hover:underline"
        >
          Görseli olmayan placeholder kayıtlarını sil
        </button>
      </form>

      {(categories ?? []).map((category) => (
        <section key={category.id} className="mt-10">
          <h2 className="font-serif text-xl text-espresso">
            {category.title}{" "}
            <span className="text-sm text-mist">
              ({category.portfolio_images.length} görsel)
            </span>
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {category.portfolio_images.map((image) => {
              const url = storagePublicUrl("portfolio", image.image_path);
              const isPlaceholder = !image.image_path;
              return (
                <div
                  key={image.id}
                  className="rounded-xl border border-espresso/10 bg-white/50 p-3"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-champagne">
                    {url ? (
                      <Image
                        src={url}
                        alt={image.caption}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-espresso/50">
                        Görsel yok
                      </div>
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm text-espresso">
                    {image.caption}
                    {isPlaceholder && (
                      <span className="ml-1 text-xs text-mist">(placeholder)</span>
                    )}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <form action={toggleFeatured}>
                      <input type="hidden" name="id" value={image.id} />
                      <input
                        type="hidden"
                        name="next"
                        value={String(!image.is_featured)}
                      />
                      <button
                        type="submit"
                        className={
                          image.is_featured
                            ? "text-gold-dark"
                            : "text-mist hover:text-gold-dark"
                        }
                      >
                        {image.is_featured ? "★ Öne çıkan" : "☆ Öne çıkar"}
                      </button>
                    </form>
                    <form action={deletePortfolioImage}>
                      <input type="hidden" name="id" value={image.id} />
                      <input
                        type="hidden"
                        name="image_path"
                        value={image.image_path ?? ""}
                      />
                      <button
                        type="submit"
                        className="text-red-700 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                  <PortfolioImageEditForm image={image} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
