"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreateCategoryForm,
  CategoryForm,
} from "@/components/admin/CategoryForm";
import { setCategoryCover } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { storagePublicUrl } from "@/lib/supabase/public";
import { cn } from "@/lib/utils";

export type TreeCategory = {
  id: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  sort_order: number;
  parent_id: string | null;
  cover_image_id: string | null;
};

export type TreeImage = {
  id: string;
  caption: string;
  image_path: string | null;
  category_id: string;
  sort_order: number;
};

type ParentOption = { id: string; title: string };

function CoverThumb({
  url,
  label,
  size = "md",
}: {
  url: string | null;
  label: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-champagne",
        dim,
      )}
    >
      {url ? (
        <Image src={url} alt={label} fill sizes="56px" className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-[10px] text-espresso/40">
          —
        </div>
      )}
    </div>
  );
}

function CoverPicker({
  categoryId,
  coverImageId,
  candidates,
  groupLabels,
}: {
  categoryId: string;
  coverImageId: string | null;
  candidates: TreeImage[];
  groupLabels: Map<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, TreeImage[]>();
    for (const image of candidates) {
      const list = map.get(image.category_id) ?? [];
      list.push(image);
      map.set(image.category_id, list);
    }
    return [...map.entries()];
  }, [candidates]);

  function choose(imageId: string | null) {
    const fd = new FormData();
    fd.set("category_id", categoryId);
    if (imageId) fd.set("image_id", imageId);
    startTransition(async () => {
      const result = await setCategoryCover(fd);
      setMessage(result.message ?? null);
      if (result.status === "success") router.refresh();
    });
  }

  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-espresso/20 bg-sand/30 p-4 text-sm text-mocha">
        Bu klasörde henüz görsel yok.{" "}
        <Link
          href={`/admin/portfolyo?category=${categoryId}`}
          className="underline underline-offset-2 hover:text-espresso"
        >
          Görseller sayfasından yükleyin
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-espresso">Klasör kapağı</p>
        {coverImageId && (
          <button
            type="button"
            disabled={pending}
            onClick={() => choose(null)}
            className="text-xs text-mist underline-offset-2 hover:underline disabled:opacity-50"
          >
            Kapağı kaldır
          </button>
        )}
      </div>
      <p className="text-xs text-mocha">
        Kartlarda ve üst klasör önizlemesinde kullanılacak görseli seçin.
      </p>
      <div className="space-y-4">
        {grouped.map(([catId, images]) => (
          <div key={catId}>
            {grouped.length > 1 && (
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-gold-dark">
                {groupLabels.get(catId) ?? "Görseller"}
              </p>
            )}
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {images.map((image) => {
                const url = storagePublicUrl("portfolio", image.image_path);
                const selected = coverImageId === image.id;
                return (
                  <button
                    key={image.id}
                    type="button"
                    disabled={pending || !url}
                    onClick={() => choose(image.id)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg border transition",
                      selected
                        ? "border-gold ring-2 ring-gold/40"
                        : "border-espresso/10 hover:border-gold/50",
                      pending && "opacity-60",
                    )}
                    title={image.caption}
                  >
                    {url ? (
                      <Image
                        src={url}
                        alt={image.caption}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                    {selected && (
                      <span className="absolute inset-x-0 bottom-0 bg-espresso/70 py-0.5 text-center text-[10px] text-cream">
                        Kapak
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {message && <p className="text-xs text-mocha">{message}</p>}
    </div>
  );
}

function FolderRow({
  category,
  depth,
  imageCount,
  coverUrl,
  selected,
  onSelect,
}: {
  category: TreeCategory;
  depth: 0 | 1;
  imageCount: number;
  coverUrl: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
        selected
          ? "border-gold/50 bg-gold/5"
          : "border-espresso/10 bg-white/50 hover:border-espresso/25",
        depth === 1 && "ml-6 sm:ml-10",
      )}
    >
      <CoverThumb url={coverUrl} label={category.title} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="truncate font-medium text-espresso">{category.title}</p>
          {depth === 1 && (
            <span className="text-[10px] uppercase tracking-[0.14em] text-gold-dark">
              Alt klasör
            </span>
          )}
        </div>
        <p className="truncate text-xs text-mocha">
          {category.short || category.slug} · {imageCount} görsel · sıra{" "}
          {category.sort_order}
        </p>
      </div>
      <span className="shrink-0 text-xs text-mist">
        {selected ? "Düzenleniyor" : "Düzenle"}
      </span>
    </button>
  );
}

export function CategoryTreeManager({
  categories,
  images,
}: {
  categories: TreeCategory[];
  images: TreeImage[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    categories[0]?.id ?? null,
  );

  const parents: ParentOption[] = categories
    .filter((c) => !c.parent_id)
    .map((c) => ({ id: c.id, title: c.title }));

  const tops = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const imagesByCategory = useMemo(() => {
    const map = new Map<string, TreeImage[]>();
    for (const image of images) {
      const list = map.get(image.category_id) ?? [];
      list.push(image);
      map.set(image.category_id, list);
    }
    return map;
  }, [images]);

  const imageById = useMemo(() => {
    const map = new Map<string, TreeImage>();
    for (const image of images) map.set(image.id, image);
    return map;
  }, [images]);

  function coverUrlFor(category: TreeCategory): string | null {
    if (category.cover_image_id) {
      const explicit = imageById.get(category.cover_image_id);
      const url = storagePublicUrl("portfolio", explicit?.image_path ?? null);
      if (url) return url;
    }
    const own = imagesByCategory.get(category.id) ?? [];
    if (own[0]) return storagePublicUrl("portfolio", own[0].image_path);
    if (!category.parent_id) {
      const children = categories.filter((c) => c.parent_id === category.id);
      for (const child of children) {
        if (child.cover_image_id) {
          const img = imageById.get(child.cover_image_id);
          const url = storagePublicUrl("portfolio", img?.image_path ?? null);
          if (url) return url;
        }
        const childImages = imagesByCategory.get(child.id) ?? [];
        if (childImages[0]) {
          return storagePublicUrl("portfolio", childImages[0].image_path);
        }
      }
    }
    return null;
  }

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  const coverCandidates = useMemo(() => {
    if (!selected) return [] as TreeImage[];
    const own = imagesByCategory.get(selected.id) ?? [];
    if (selected.parent_id) return own;
    const childIds = categories
      .filter((c) => c.parent_id === selected.id)
      .map((c) => c.id);
    const fromChildren = childIds.flatMap(
      (id) => imagesByCategory.get(id) ?? [],
    );
    return [...own, ...fromChildren];
  }, [selected, imagesByCategory, categories]);

  const groupLabels = useMemo(() => {
    const map = new Map<string, string>();
    if (!selected) return map;
    map.set(selected.id, "Bu klasör");
    for (const child of categories.filter((c) => c.parent_id === selected.id)) {
      map.set(child.id, child.title);
    }
    return map;
  }, [selected, categories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-mocha">
          Portfolyo klasörlerini yönetin. Her düzey için kapak görseli seçin;
          alt klasörler üst klasörün altında görünür.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            href="/admin/portfolyo"
          >
            Görsellere git
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Oluşturmayı kapat" : "Yeni klasör"}
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="rounded-2xl border border-espresso/10 bg-white/50 p-5">
          <h2 className="font-serif text-xl text-espresso">Yeni klasör</h2>
          <p className="mt-1 text-xs text-mocha">
            Üst seviye veya mevcut bir üst klasörün altına ekleyin (tek seviye
            alt klasör).
          </p>
          <div className="mt-4">
            <CreateCategoryForm parents={parents} />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-dark">
            Klasör ağacı
          </p>
          {tops.length === 0 && (
            <p className="rounded-xl border border-dashed border-espresso/15 p-6 text-sm text-mocha">
              Henüz klasör yok. “Yeni klasör” ile başlayın.
            </p>
          )}
          {tops.map((top) => {
            const children = categories
              .filter((c) => c.parent_id === top.id)
              .sort((a, b) => a.sort_order - b.sort_order);
            return (
              <div key={top.id} className="space-y-2">
                <FolderRow
                  category={top}
                  depth={0}
                  imageCount={(imagesByCategory.get(top.id) ?? []).length}
                  coverUrl={coverUrlFor(top)}
                  selected={selectedId === top.id}
                  onSelect={() => setSelectedId(top.id)}
                />
                {children.map((child) => (
                  <FolderRow
                    key={child.id}
                    category={child}
                    depth={1}
                    imageCount={(imagesByCategory.get(child.id) ?? []).length}
                    coverUrl={coverUrlFor(child)}
                    selected={selectedId === child.id}
                    onSelect={() => setSelectedId(child.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-espresso/10 bg-white/50 p-5">
          {!selected ? (
            <p className="text-sm text-mocha">
              Düzenlemek için soldan bir klasör seçin.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-3 border-b border-espresso/10 pb-4">
                <CoverThumb
                  url={coverUrlFor(selected)}
                  label={selected.title}
                />
                <div className="min-w-0">
                  <h2 className="font-serif text-2xl text-espresso">
                    {selected.title}
                  </h2>
                  <p className="text-xs text-mist">/{selected.slug}</p>
                  <Link
                    href={`/admin/portfolyo?category=${selected.id}`}
                    className="mt-2 inline-block text-xs text-mocha underline-offset-2 hover:underline"
                  >
                    Bu klasörün görsellerini aç →
                  </Link>
                </div>
              </div>

              <CoverPicker
                categoryId={selected.id}
                coverImageId={selected.cover_image_id}
                candidates={coverCandidates}
                groupLabels={groupLabels}
              />

              <div className="border-t border-espresso/10 pt-5">
                <p className="mb-3 text-sm font-medium text-espresso">
                  Klasör bilgileri
                </p>
                <CategoryForm category={selected} parents={parents} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
