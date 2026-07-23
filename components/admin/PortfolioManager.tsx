"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  bulkDeletePortfolioImages,
  bulkMovePortfolioImages,
  bulkSetFeatured,
  deletePlaceholderImages,
  deletePortfolioImage,
  toggleFeatured,
} from "@/app/admin/actions";
import { PortfolioUploader } from "@/components/admin/PortfolioUploader";
import { PortfolioImageEditForm } from "@/components/admin/PortfolioImageEditForm";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { storagePublicUrl } from "@/lib/supabase/public";
import { cn } from "@/lib/utils";

export type AdminCategoryOption = {
  id: string;
  slug: string;
  title: string;
  label: string;
};

export type AdminPortfolioImage = {
  id: string;
  caption: string;
  orientation: string;
  image_path: string | null;
  is_featured: boolean;
  sort_order: number;
  category_id: string;
  category_title: string;
  category_label: string;
};

const PAGE_SIZE = 24;

export function PortfolioManager({
  categories,
  images,
}: {
  categories: AdminCategoryOption[];
  images: AdminPortfolioImage[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [moveTo, setMoveTo] = useState(categories[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return images.filter((image) => {
      if (categoryFilter && image.category_id !== categoryFilter) return false;
      if (featuredOnly && !image.is_featured) return false;
      if (q && !image.caption.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [images, categoryFilter, featuredOnly, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function toggleId(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePageAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pageItems.every((img) => next.has(img.id));
      for (const img of pageItems) {
        if (allSelected) next.delete(img.id);
        else next.add(img.id);
      }
      return next;
    });
  }

  function runBulk(
    action: (formData: FormData) => Promise<{ message?: string; status: string }>,
    extra?: (fd: FormData) => void,
  ) {
    if (selected.size === 0) {
      setMessage("Önce görsel seçin.");
      return;
    }
    const fd = new FormData();
    for (const id of selected) fd.append("ids", id);
    extra?.(fd);
    startTransition(async () => {
      const result = await action(fd);
      setMessage(result.message ?? null);
      if (result.status === "success") {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      <PortfolioUploader
        categories={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.label,
        }))}
      />

      <form action={deletePlaceholderImages}>
        <button
          type="submit"
          className="text-sm text-red-700 underline-offset-4 hover:underline"
        >
          Görseli olmayan placeholder kayıtlarını sil
        </button>
      </form>

      <div className="rounded-2xl border border-espresso/10 bg-white/50 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Kategori"
            name="filter_category"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tümü</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </SelectField>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-espresso">Ara (başlık)</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-espresso/20 bg-white/60 px-4 py-3 text-sm"
              placeholder="Örn. ilk uyku"
            />
          </label>
          <label className="flex items-end gap-2 pb-3 text-sm text-mocha">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => {
                setFeaturedOnly(e.target.checked);
                setPage(1);
              }}
            />
            Yalnızca öne çıkanlar
          </label>
          <div className="flex items-end text-sm text-mocha">
            {filtered.length} görsel · sayfa {currentPage}/{totalPages}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-espresso/10 pt-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={togglePageAll}
          >
            Sayfadakileri seç / kaldır
          </Button>
          <SelectField
            label="Taşı"
            name="move_to"
            value={moveTo}
            onChange={(e) => setMoveTo(e.target.value)}
            className="min-w-[12rem]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </SelectField>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              runBulk(bulkMovePortfolioImages, (fd) =>
                fd.set("category_id", moveTo),
              )
            }
          >
            Seçilenleri taşı
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              runBulk(bulkSetFeatured, (fd) => fd.set("featured", "true"))
            }
          >
            Öne çıkar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              runBulk(bulkSetFeatured, (fd) => fd.set("featured", "false"))
            }
          >
            Öne çıkarmayı kaldır
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            className="border-red-300 text-red-800"
            onClick={() => {
              if (
                window.confirm(
                  `${selected.size} görseli silmek istediğinize emin misiniz?`,
                )
              ) {
                runBulk(bulkDeletePortfolioImages);
              }
            }}
          >
            Seçilenleri sil
          </Button>
        </div>
        {message && <p className="mt-3 text-sm text-mocha">{message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {pageItems.map((image) => {
          const url = storagePublicUrl("portfolio", image.image_path);
          const checked = selected.has(image.id);
          return (
            <div
              key={image.id}
              className={cn(
                "rounded-xl border bg-white/50 p-3",
                checked ? "border-gold/50" : "border-espresso/10",
              )}
            >
              <label className="mb-2 flex items-center gap-2 text-xs text-mocha">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleId(image.id)}
                />
                Seç
              </label>
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
              </p>
              <p className="truncate text-xs text-mist">{image.category_label}</p>
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
              <PortfolioImageEditForm
                image={image}
                categories={categories}
                currentCategoryId={image.category_id}
              />
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Önceki
          </Button>
          <span className="text-sm text-mocha">
            {currentPage} / {totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
