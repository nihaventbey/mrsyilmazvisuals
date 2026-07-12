import { heroCaptions, heroPalettes } from "./heroData";

function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * CSS-only version of the spreading-photographs concept for browsers
 * without WebGL. Reads the scroll progress from the `--p` custom
 * property set on the hero stage.
 */
export function HeroFallback() {
  const golden = 2.399963;
  const count = heroCaptions.length;

  const cards = Array.from({ length: count }, (_, i) => {
    const f = (i + 0.7) / count;
    const angle = i * golden;
    const radius = 12 + 34 * Math.sqrt(f);
    return {
      caption: heroCaptions[i],
      palette: heroPalettes[i % heroPalettes.length],
      tx: `${(Math.cos(angle) * radius * 1.15).toFixed(1)}vw`,
      ty: `${(Math.sin(angle) * radius * 0.62).toFixed(1)}vh`,
      r0: `${((seeded(i, 3) - 0.5) * 26).toFixed(1)}deg`,
      dr: `${((seeded(i, 7) - 0.5) * 24).toFixed(1)}deg`,
      z: i,
      startShift: `${((seeded(i, 1) - 0.5) * 2.2).toFixed(1)}rem`,
    };
  });

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {cards.map((card, i) => {
        const [light, mid, dark] = card.palette;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-36 sm:w-44"
            style={{
              zIndex: card.z,
              transform: [
                "translate(-50%, -52%)",
                // Pile rests lower while stacked, drifts to center as it spreads
                "translateY(calc((1 - var(--p, 0)) * 19vh))",
                `translateX(${card.startShift})`,
                `translate(calc(var(--p, 0) * ${card.tx}), calc(var(--p, 0) * ${card.ty}))`,
                `rotate(calc(${card.r0} + var(--p, 0) * ${card.dr}))`,
                "scale(calc(1 + var(--p, 0) * 0.3))",
              ].join(" "),
              transition: "transform 0.15s linear",
            }}
          >
            <div className="rounded-[4px] bg-[#fdfaf4] p-2 pb-7 shadow-[0_18px_45px_-18px_rgba(59,46,38,0.45)]">
              <div
                className="aspect-[4/5] w-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, rgba(255,248,230,0.85), transparent 60%), linear-gradient(135deg, ${light} 0%, ${mid} 55%, ${dark} 100%)`,
                }}
              />
              <p className="mt-1.5 text-center font-serif text-[11px] italic text-[#5a4636] sm:text-xs">
                {card.caption}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
