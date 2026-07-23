"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { CameraMemoriesLoader } from "@/components/ui/CameraMemoriesLoader";
import { HeroFallback } from "@/components/home/HeroFallback";
import type { ResolvedHeroCard } from "@/lib/hero";

const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => null,
});

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

export function Hero({
  tagline,
  description,
  cards,
}: {
  tagline: string;
  description: string;
  cards: ResolvedHeroCard[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [renderer, setRenderer] = useState<"pending" | "webgl" | "fallback">(
    "pending",
  );
  const [sceneReady, setSceneReady] = useState(false);

  const markReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  useEffect(() => {
    setRenderer(supportsWebGL() ? "webgl" : "fallback");
  }, []);

  useEffect(() => {
    if (sceneReady) return;
    const timeout = window.setTimeout(() => setSceneReady(true), 12000);
    return () => window.clearTimeout(timeout);
  }, [sceneReady]);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      if (!sceneReady) {
        progressRef.current = 0;
        stageRef.current?.style.setProperty("--p", "0");
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
      progressRef.current = progress;

      stageRef.current?.style.setProperty("--p", progress.toFixed(4));

      if (introRef.current) {
        const fade = 1 - clamp01((progress - 0.05) / 0.3);
        introRef.current.style.opacity = fade.toFixed(3);
        introRef.current.style.transform = `translateY(${(-progress * 90).toFixed(1)}px)`;
        introRef.current.style.pointerEvents = fade < 0.4 ? "none" : "auto";
      }

      if (outroRef.current) {
        const appear = clamp01((progress - 0.62) / 0.28);
        outroRef.current.style.opacity = appear.toFixed(3);
        outroRef.current.style.transform = `translateY(${((1 - appear) * 40).toFixed(1)}px)`;
        outroRef.current.style.pointerEvents = appear > 0.6 ? "auto" : "none";
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = (1 - clamp01(progress / 0.15)).toFixed(3);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sceneReady]);

  return (
    <section ref={sectionRef} className="relative isolate z-0 -mt-20 h-[280vh] sm:h-[300vh]">
      <div
        ref={stageRef}
        className="sticky top-0 z-0 flex h-[100dvh] w-full max-w-[100vw] items-center justify-center overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 42%, #f4e8d3 0%, #fbf7f0 60%, #f6efe2 100%)",
          }}
        />

        {!sceneReady ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-cream/70 backdrop-blur-[2px]">
            <CameraMemoriesLoader message="Anılar hazırlanıyor…" />
          </div>
        ) : null}

        {renderer === "webgl" ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700"
            style={{ opacity: sceneReady ? 1 : 0 }}
          >
            <Hero3D
              progressRef={progressRef}
              cards={cards}
              onReady={markReady}
              onContextLost={() => {
                setRenderer("fallback");
              }}
            />
          </div>
        ) : null}

        {renderer === "fallback" ? (
          <HeroFallback cards={cards} onReady={markReady} />
        ) : null}

        <div
          ref={introRef}
          className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-[22vh] text-center sm:px-6 sm:pb-[30vh]"
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-dark sm:mb-5 sm:text-xs sm:tracking-[0.35em]">
            Bebek · Doğum · Düğün · Etkinlik
          </p>
          <h1 className="break-words text-[1.85rem] leading-[1.12] text-espresso drop-shadow-[0_2px_18px_rgba(251,247,240,0.9)] min-[400px]:text-4xl sm:text-6xl lg:text-7xl">
            {tagline}
          </h1>
          <p className="mx-auto mt-4 max-w-[18rem] text-base leading-relaxed text-mocha sm:mt-6 sm:max-w-md sm:text-lg">
            Kaydırın; anılar sayfaya yayılsın.
          </p>
        </div>

        <div
          ref={outroRef}
          className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col items-center justify-center px-4 text-center sm:px-6"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <div className="w-full max-w-[min(100%,24rem)] rounded-2xl bg-cream/85 px-4 py-6 backdrop-blur-sm sm:max-w-lg sm:rounded-3xl sm:px-14 sm:py-10">
            <h2 className="break-words font-serif text-xl leading-snug text-espresso sm:text-3xl">
              Her kare bir hikâye anlatır
            </h2>
            <p className="mx-auto mt-3 max-w-md break-words text-[13px] leading-relaxed text-mocha sm:mt-4 sm:text-base">
              {description}
            </p>
            <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Button href="/portfolyo" size="md" className="w-full sm:w-auto sm:px-8 sm:py-4 sm:text-base">
                Portfolyoyu Keşfet
              </Button>
              <Button
                href="/rezervasyon"
                size="md"
                variant="outline"
                className="w-full sm:w-auto sm:px-8 sm:py-4 sm:text-base"
              >
                Rezervasyon Oluştur
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={hintRef}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 sm:bottom-8"
          style={{ opacity: sceneReady ? undefined : 0 }}
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-espresso/25 p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-gold-dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
