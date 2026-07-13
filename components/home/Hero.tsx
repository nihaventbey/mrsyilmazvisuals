"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
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
  const [webglOk, setWebglOk] = useState(false);

  useEffect(() => {
    setWebglOk(supportsWebGL());
  }, []);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
      progressRef.current = progress;

      stageRef.current?.style.setProperty("--p", progress.toFixed(4));

      // Title fades and lifts away as the photographs take over
      if (introRef.current) {
        const fade = 1 - clamp01((progress - 0.05) / 0.3);
        introRef.current.style.opacity = fade.toFixed(3);
        introRef.current.style.transform = `translateY(${(-progress * 90).toFixed(1)}px)`;
        introRef.current.style.pointerEvents = fade < 0.4 ? "none" : "auto";
      }

      // Closing line + CTAs appear once the spread is nearly complete
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
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate z-0 -mt-20 h-[300vh]">
      <div
        ref={stageRef}
        className="sticky top-0 z-0 flex h-screen w-full items-center justify-center overflow-hidden"
      >
        {/* Warm backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 42%, #f4e8d3 0%, #fbf7f0 60%, #f6efe2 100%)",
          }}
        />

        {/* Spreading photographs: WebGL scene or CSS fallback */}
        {webglOk ? (
          <div className="pointer-events-none absolute inset-0 z-0">
            <Hero3D
              progressRef={progressRef}
              cards={cards}
              onContextLost={() => setWebglOk(false)}
            />
          </div>
        ) : (
          <HeroFallback cards={cards} />
        )}

        {/* Intro: title over the photo pile */}
        <div
          ref={introRef}
          className="relative z-10 mx-auto max-w-3xl px-6 pb-[30vh] text-center"
        >
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-gold-dark">
            Bebek · Doğum · Hamile · Düğün
          </p>
          <h1 className="text-5xl leading-[1.05] text-espresso drop-shadow-[0_2px_18px_rgba(251,247,240,0.9)] sm:text-6xl lg:text-7xl">
            {tagline}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-mocha">
            Kaydırın; anılar sayfaya yayılsın.
          </p>
        </div>

        {/* Outro: revealed when the photos have spread across the page */}
        <div
          ref={outroRef}
          className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <div className="rounded-3xl bg-cream/80 px-8 py-10 backdrop-blur-sm sm:px-14">
            <h2 className="font-serif text-3xl text-espresso sm:text-4xl">
              Her kare bir hikâye anlatır
            </h2>
            <p className="mx-auto mt-4 max-w-md text-mocha">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/portfolyo" size="lg">
                Portfolyoyu Keşfet
              </Button>
              <Button href="/rezervasyon" size="lg" variant="outline">
                Rezervasyon Oluştur
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          ref={hintRef}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-espresso/25 p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-gold-dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
