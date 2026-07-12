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
}: {
  image: PortfolioImage;
  index: number;
  className?: string;
}) {
  if (image.imageUrl) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={image.imageUrl}
          alt={image.caption}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
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
              className={cn(
                "w-full rounded-2xl transition-transform duration-500 group-hover:scale-[1.03]",
                image.orientation === "portrait"
                  ? "aspect-[3/4]"
                  : "aspect-[4/3]",
              )}
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso/90 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Kapat"
            onClick={close}
            className="absolute right-6 top-6 text-3xl text-cream/80 transition-colors hover:text-cream"
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
            className="absolute left-4 z-10 text-4xl text-cream/70 transition-colors hover:text-cream sm:left-8"
          >
            ‹
          </button>

          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <GalleryImage
              image={images[active]}
              index={active}
              className={cn(
                "w-full rounded-2xl",
                images[active].orientation === "portrait"
                  ? "aspect-[3/4] max-h-[80vh]"
                  : "aspect-[4/3] max-h-[80vh]",
              )}
            />
            <p className="mt-4 text-center text-sm text-cream/80">
              {images[active].caption} · {active + 1} / {images.length}
            </p>
          </div>

          <button
            type="button"
            aria-label="Sonraki"
            onClick={(e) => {
              e.stopPropagation();
              show(1);
            }}
            className="absolute right-4 z-10 text-4xl text-cream/70 transition-colors hover:text-cream sm:right-8"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
