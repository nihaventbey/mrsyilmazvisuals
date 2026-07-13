import Image from "next/image";
import type { ResolvedHeroCard } from "@/lib/hero";

function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function HeroFallback({ cards }: { cards: ResolvedHeroCard[] }) {
  const golden = 2.399963;
  const count = cards.length;

  const layout = Array.from({ length: count }, (_, i) => {
    const f = (i + 0.7) / count;
    const angle = i * golden;
    const radius = 12 + 34 * Math.sqrt(f);
    return {
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
        const pos = layout[i];
        return (
          <div
            key={card.id}
            className="absolute left-1/2 top-1/2 w-36 sm:w-44"
            style={{
              zIndex: pos.z,
              transform: [
                "translate(-50%, -52%)",
                "translateY(calc((1 - var(--p, 0)) * 19vh))",
                `translateX(${pos.startShift})`,
                `translate(calc(var(--p, 0) * ${pos.tx}), calc(var(--p, 0) * ${pos.ty}))`,
                `rotate(calc(${pos.r0} + var(--p, 0) * ${pos.dr}))`,
                "scale(calc(1 + var(--p, 0) * 0.3))",
              ].join(" "),
              transition: "transform 0.15s linear",
            }}
          >
            <div className="rounded-[4px] bg-[#fdfaf4] p-2 pb-7 shadow-[0_18px_45px_-18px_rgba(59,46,38,0.45)]">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {card.imageUrl ? (
                  <Image
                    src={card.imageUrl}
                    alt={card.caption}
                    fill
                    sizes="176px"
                    className="object-cover"
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
