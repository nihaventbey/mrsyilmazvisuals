import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function AuthorPhoto({ src, alt, className, priority = false }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-sand/60",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 480px"
        className="object-cover"
      />
    </div>
  );
}
