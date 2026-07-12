"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadPortfolioImages } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

type Category = { id: string; title: string; slug: string };

type PendingFile = {
  id: string;
  file: File;
  preview: string;
  caption: string;
  orientation: "portrait" | "landscape";
};

function captionFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function detectOrientation(file: File): Promise<"portrait" | "landscape"> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.width >= img.height ? "landscape" : "portrait");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("portrait");
    };
    img.src = url;
  });
}

export function PortfolioUploader({ categories }: { categories: Category[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [isFeatured, setIsFeatured] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (imageFiles.length === 0) return;

    const entries = await Promise.all(
      imageFiles.map(async (file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        preview: URL.createObjectURL(file),
        caption: captionFromFilename(file.name),
        orientation: await detectOrientation(file),
      })),
    );

    setPending((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      return [...prev, ...entries.filter((e) => !existing.has(e.id))];
    });
    setMessage(null);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      void addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  function removePending(id: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  function updateCaption(id: string, caption: string) {
    setPending((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p)),
    );
  }

  function handleUpload() {
    if (!categoryId) {
      setMessage({ type: "error", text: "Lütfen bir kategori seçin." });
      return;
    }
    if (pending.length === 0) {
      setMessage({ type: "error", text: "Yüklenecek görsel seçin." });
      return;
    }

    const formData = new FormData();
    formData.set("category_id", categoryId);
    if (isFeatured) formData.set("is_featured", "on");
    formData.set(
      "meta",
      JSON.stringify(
        pending.map((p) => ({
          caption: p.caption,
          orientation: p.orientation,
        })),
      ),
    );
    for (const item of pending) {
      formData.append("files", item.file);
    }

    startTransition(async () => {
      const result = await uploadPortfolioImages(formData);
      setMessage({
        type: result.status === "success" ? "success" : "error",
        text: result.message ?? "İşlem tamamlandı.",
      });
      if (result.status === "success") {
        pending.forEach((p) => URL.revokeObjectURL(p.preview));
        setPending([]);
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="rounded-2xl border border-espresso/10 bg-white/50 p-6">
      <h2 className="font-serif text-lg text-espresso">Görsel Yükle</h2>
      <p className="mt-1 text-sm text-mocha">
        Bilgisayarınızdan veya telefonunuzdan birden fazla fotoğraf seçin.
        Sürükle-bırak da desteklenir.
      </p>

      {message && (
        <div
          className={cn(
            "mt-4 rounded-xl px-4 py-3 text-sm",
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800",
          )}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Kategori"
          name="category_id"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </SelectField>
        <label className="flex items-end gap-2 pb-3 text-sm text-mocha">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Tümünü ana sayfada öne çıkar
        </label>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragOver
            ? "border-gold bg-gold/5"
            : "border-espresso/20 hover:border-gold/50 hover:bg-sand/30",
        )}
      >
        <p className="font-medium text-espresso">Fotoğrafları buraya sürükleyin</p>
        <p className="mt-1 text-sm text-mocha">veya tıklayarak dosya seçin</p>
        <p className="mt-2 text-xs text-mist">JPG, PNG, WEBP — birden fazla seçilebilir</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
          }}
        />
      </div>

      {pending.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-espresso">
            {pending.length} görsel hazır
          </p>
          <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
            {pending.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-espresso/10 bg-cream/40 p-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-champagne">
                  <Image
                    src={item.preview}
                    alt={item.caption}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    value={item.caption}
                    onChange={(e) => updateCaption(item.id, e.target.value)}
                    className="w-full rounded-lg border border-espresso/15 bg-white/70 px-3 py-1.5 text-sm text-espresso"
                    placeholder="Başlık"
                  />
                  <p className="mt-1 text-xs text-mist">
                    {item.orientation === "portrait" ? "Dikey" : "Yatay"} ·{" "}
                    {(item.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePending(item.id)}
                  className="shrink-0 text-xs text-red-700 hover:text-red-900"
                >
                  Kaldır
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isPending}
            >
              {isPending
                ? "Yükleniyor..."
                : `${pending.length} Görseli Yükle`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                pending.forEach((p) => URL.revokeObjectURL(p.preview));
                setPending([]);
                if (inputRef.current) inputRef.current.value = "";
              }}
              disabled={isPending}
            >
              Listeyi Temizle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
