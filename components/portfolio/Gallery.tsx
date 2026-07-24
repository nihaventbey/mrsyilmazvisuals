"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Placeholder } from "@/components/ui/Placeholder";
import type { PortfolioImage } from "@/lib/content";
import { cn } from "@/lib/utils";

function GalleryImage({
  image,
  index,
  className,
  fit = "cover",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  image: PortfolioImage;
  index: number;
  className?: string;
  fit?: "cover" | "contain" | "natural";
  sizes?: string;
}) {
  if (image.imageUrl) {
    if (fit === "natural") {
      // Masonry thumbnail: keep the photo's intrinsic aspect ratio (no crop).
      const portrait = image.orientation === "portrait";
      return (
        <Image
          src={image.imageUrl}
          alt={image.caption}
          width={portrait ? 900 : 1200}
          height={portrait ? 1200 : 900}
          sizes={sizes}
          className={cn("h-auto w-full", className)}
        />
      );
    }
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={image.imageUrl}
          alt={image.caption}
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain" : "object-cover"}
        />
      </div>
    );
  }
  return (
    <Placeholder index={index} label={image.caption} className={className} />
  );
}

export function Gallery({ images }: { images: PortfolioImage[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const show = useCallback(
    (dir: 1 | -1) =>
      setActive((current) => {
        if (current === null) return current;
        return (current + dir + images.length) % images.length;
      }),
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(1);
      if (e.key === "ArrowLeft") show(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, show]);

  const current = active !== null ? images[active] : null;

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActive(i)}
            className="group block w-full break-inside-avoid overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <GalleryImage
              image={image}
              index={i}
              fit="natural"
              className={cn(
                "rounded-2xl transition-transform duration-500 group-hover:scale-[1.03]",
                !image.imageUrl &&
                  (image.orientation === "portrait"
                    ? "aspect-[3/4] w-full"
                    : "aspect-[4/3] w-full"),
              )}
            />
          </button>
        ))}
      </div>

      {active !== null && current && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso/90 p-3 backdrop-blur-sm sm:p-6"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
        >
          <button
            type="button"
            aria-label="Kapat"
            onClick={close}
            className="absolute right-4 top-4 z-20 text-3xl leading-none text-cream/80 transition-colors hover:text-cream sm:right-6 sm:top-6"
          >
            ×
          </button>

          <button
            type="button"
            aria-label="Önceki"
            onClick={(e) => {
              e.stopPropagation();
              show(-1);
            }}
            className="absolute left-2 z-20 text-4xl text-cream/70 transition-colors hover:text-cream sm:left-6"
          >
            ‹
          </button>

          <div
            className="flex max-h-[min(92dvh,100vh)] w-full max-w-[min(96vw,72rem)] flex-col items-center gap-3 px-10 sm:px-14"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[min(78dvh,85vh)] w-full max-w-full">
              <GalleryImage
                image={current}
                index={active}
                fit="contain"
                sizes="(max-width: 768px) 96vw, 90vw"
                className="h-full w-full rounded-2xl bg-black/20"
              />
            </div>
            <p className="shrink-0 text-center text-sm text-cream/80">
              {current.caption} · {active + 1} / {images.length}
            </p>
          </div>

          <button
            type="button"
            aria-label="Sonraki"
            onClick={(e) => {
              e.stopPropagation();
              show(1);
            }}
            className="absolute right-2 z-20 text-4xl text-cream/70 transition-colors hover:text-cream sm:right-6"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
