import { cn } from "@/lib/utils";

const palettes = [
  ["#e8d7bf", "#bf9d68"],
  ["#f1e7d8", "#c9b28c"],
  ["#e3d3c3", "#a5834e"],
  ["#efe2d0", "#d0b48a"],
  ["#e6d9cc", "#b89b72"],
  ["#f0e6d8", "#c0a16b"],
];

type Props = {
  index?: number;
  label?: string;
  className?: string;
  rounded?: boolean;
};

export function Placeholder({
  index = 0,
  label,
  className,
  rounded = true,
}: Props) {
  const [from, to] = palettes[index % palettes.length];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        rounded && "rounded-2xl",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6), transparent 45%)",
        }}
      />
      {label && (
        <span className="relative z-10 px-4 text-center font-serif text-lg text-espresso/70">
          {label}
        </span>
      )}
    </div>
  );
}
