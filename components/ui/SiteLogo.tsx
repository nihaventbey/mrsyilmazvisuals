import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  name: string;
  href?: string;
  className?: string;
  imageClassName?: string;
  showName?: boolean;
  /** wordmark = yatay üst menü logosu, mark = kare/yuvarlak ikon */
  variant?: "wordmark" | "mark";
};

export function SiteLogo({
  src,
  name,
  href = "/",
  className,
  imageClassName,
  showName = true,
  variant = "mark",
}: Props) {
  const isSvg = src.endsWith(".svg");
  const hasSrc = Boolean(src);

  const image =
    variant === "wordmark" ? (
      hasSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={cn(
            "h-10 w-auto max-w-[min(220px,52vw)] object-contain object-left sm:h-11",
            imageClassName,
          )}
        />
      ) : (
        <span className="font-serif text-xl tracking-wide text-espresso sm:text-2xl">
          {name}
        </span>
      )
    ) : (
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/25 bg-cream shadow-sm",
          imageClassName ?? "h-10 w-10",
        )}
      >
        {hasSrc ? (
          isSvg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-[78%] w-[78%] object-contain" />
          ) : (
            <Image
              src={src}
              alt=""
              fill
              sizes="80px"
              className="object-contain p-1"
            />
          )
        ) : (
          <span className="font-serif text-sm text-espresso">MY</span>
        )}
      </span>
    );

  const content = (
    <>
      {image}
      {showName && variant === "mark" && (
        <span className="font-serif text-xl tracking-wide text-espresso">
          {name}
        </span>
      )}
    </>
  );

  if (!href) {
    return (
      <div className={cn("flex items-center gap-3", className)} aria-label={name}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 transition-opacity hover:opacity-85",
        className,
      )}
      aria-label={name}
    >
      {content}
    </Link>
  );
}
