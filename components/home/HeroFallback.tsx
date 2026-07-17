"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResolvedHeroCard } from "@/lib/hero";

function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function useViewportWidth() {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}

export function HeroFallback({
  cards,
  onReady,
}: {
  cards: ResolvedHeroCard[];
  onReady?: () => void;
}) {
  const golden = 2.399963;
  const count = cards.length;
  const width = useViewportWidth();
  const [imagesReady, setImagesReady] = useState(false);

  const spread =
    width < 480 ? 0.42 : width < 768 ? 0.55 : width < 1024 ? 0.75 : 1;

  useEffect(() => {
    let cancelled = false;
    const urls = cards.map((card) => card.imageUrl).filter(Boolean) as string[];

    if (urls.length === 0) {
      setImagesReady(true);
      onReady?.();
      return;
    }

    Promise.all(urls.map((url) => loadImage(url))).then(() => {
      if (cancelled) return;
      setImagesReady(true);
      onReady?.();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const layout = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const f = (i + 0.7) / count;
        const angle = i * golden;
        const radius = (10 + 28 * Math.sqrt(f)) * spread;
        return {
          tx: `${(Math.cos(angle) * radius * 1.05).toFixed(1)}vw`,
          ty: `${(Math.sin(angle) * radius * 0.55).toFixed(1)}vh`,
          r0: `${((seeded(i, 3) - 0.5) * 26).toFixed(1)}deg`,
          dr: `${((seeded(i, 7) - 0.5) * 24).toFixed(1)}deg`,
          z: i,
          startShift: `${((seeded(i, 1) - 0.5) * 1.6).toFixed(1)}rem`,
        };
      }),
    [count, spread],
  );

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden transition-opacity duration-700"
      style={{ opacity: imagesReady ? 1 : 0 }}
    >
      {cards.map((card, i) => {
        const [light, mid, dark] = card.palette;
        const pos = layout[i];
        return (
          <div
            key={card.id}
            className="absolute left-1/2 top-1/2 w-28 sm:w-36 md:w-44"
            style={{
              zIndex: pos.z,
              transform: [
                "translate(-50%, -52%)",
                "translateY(calc((1 - var(--p, 0)) * 16vh))",
                `translateX(${pos.startShift})`,
                `translate(calc(var(--p, 0) * ${pos.tx}), calc(var(--p, 0) * ${pos.ty}))`,
                `rotate(calc(${pos.r0} + var(--p, 0) * ${pos.dr}))`,
                "scale(calc(1 + var(--p, 0) * 0.18))",
              ].join(" "),
              transition: "transform 0.15s linear",
            }}
          >
            <div className="rounded-[4px] bg-[#fdfaf4] p-1.5 pb-5 shadow-[0_18px_45px_-18px_rgba(59,46,38,0.45)] sm:p-2 sm:pb-7">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {card.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    decoding="async"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, rgba(255,248,230,0.85), transparent 60%), linear-gradient(135deg, ${light} 0%, ${mid} 55%, ${dark} 100%)`,
                    }}
                  />
                )}
              </div>
              <p className="mt-1 text-center font-serif text-[10px] italic text-[#5a4636] sm:mt-1.5 sm:text-xs">
                {card.caption}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
