"use client";

import { cn } from "@/lib/utils";

const DEFAULT_MESSAGES = [
  "Anılar kaydediliyor…",
  "Poz veriliyor…",
  "Polaroidler yerleşiyor…",
  "Işık ayarlanıyor…",
];

type Props = {
  /** Full-screen cream veil while work finishes. */
  overlay?: boolean;
  /** Compact inline block for buttons / panels. */
  compact?: boolean;
  message?: string;
  className?: string;
};

export function CameraMemoriesLoader({
  overlay = false,
  compact = false,
  message,
  className,
}: Props) {
  const caption = message ?? DEFAULT_MESSAGES[0];

  const scene = (
    <div
      className={cn(
        "camera-memories-loader relative flex flex-col items-center justify-center",
        compact ? "gap-3 py-2" : "gap-6 py-4",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "relative",
          compact ? "h-20 w-28" : "h-36 w-48 sm:h-44 sm:w-56",
        )}
      >
        {/* Floating polaroids */}
        <span
          className="camera-polaroid camera-polaroid--a absolute left-0 top-2"
          aria-hidden
        >
          <span className="camera-polaroid-photo bg-gradient-to-br from-champagne via-sand to-gold/40" />
        </span>
        <span
          className="camera-polaroid camera-polaroid--b absolute right-0 top-0"
          aria-hidden
        >
          <span className="camera-polaroid-photo bg-gradient-to-br from-gold/50 via-champagne to-sand" />
        </span>
        <span
          className="camera-polaroid camera-polaroid--c absolute bottom-1 left-1/2"
          aria-hidden
        >
          <span className="camera-polaroid-photo bg-gradient-to-br from-sand via-cream to-gold/30" />
        </span>

        {/* Sparkle heart */}
        <span
          className="camera-sparkle absolute left-[18%] top-[8%] text-gold-dark"
          aria-hidden
        >
          ♥
        </span>
        <span
          className="camera-sparkle camera-sparkle--delay absolute right-[14%] top-[18%] text-gold"
          aria-hidden
        >
          ✦
        </span>

        {/* Camera body */}
        <div className="camera-body absolute inset-x-0 bottom-0 mx-auto flex flex-col items-center">
          <svg
            viewBox="0 0 120 88"
            className={cn(compact ? "h-16 w-[5.5rem]" : "h-24 w-36 sm:h-28 sm:w-40")}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <rect
              x="8"
              y="28"
              width="104"
              height="52"
              rx="10"
              className="fill-espresso"
            />
            <rect
              x="18"
              y="18"
              width="36"
              height="14"
              rx="4"
              className="fill-mocha"
            />
            <circle cx="72" cy="52" r="22" className="fill-mocha" />
            <circle cx="72" cy="52" r="14" className="fill-espresso" />
            <circle
              cx="72"
              cy="52"
              r="7"
              className="fill-gold/70 camera-lens-glow"
            />
            <circle cx="28" cy="44" r="4" className="fill-gold camera-shutter" />
            <rect
              x="40"
              y="36"
              width="12"
              height="4"
              rx="1"
              className="fill-champagne/60"
            />
            {/* Flash burst */}
            <g className="camera-flash origin-[28px_44px]">
              <path
                d="M28 30 L30 36 L36 34 L31 39 L35 44 L28 41 L21 44 L25 39 L20 34 L26 36 Z"
                className="fill-gold"
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p
          className={cn(
            "font-serif text-espresso",
            compact ? "text-base" : "text-xl sm:text-2xl",
          )}
        >
          {caption}
        </p>
        {!compact ? (
          <p className="camera-message-cycle mt-2 text-sm text-mocha">
            Her kare bir anı
          </p>
        ) : null}
        <div
          className="mx-auto mt-3 flex items-center justify-center gap-1.5"
          aria-hidden
        >
          <span className="camera-dot h-1.5 w-1.5 rounded-full bg-gold-dark" />
          <span className="camera-dot camera-dot--2 h-1.5 w-1.5 rounded-full bg-gold-dark" />
          <span className="camera-dot camera-dot--3 h-1.5 w-1.5 rounded-full bg-gold-dark" />
        </div>
      </div>
      <span className="sr-only">Yükleniyor</span>
    </div>
  );

  if (!overlay) return scene;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-cream/85 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-espresso/10 bg-white/70 px-6 py-10 shadow-[0_20px_60px_-30px_rgba(59,46,38,0.45)]">
        {scene}
      </div>
    </div>
  );
}
