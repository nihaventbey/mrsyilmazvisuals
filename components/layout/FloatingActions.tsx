"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

type FloatingActionsProps = {
  whatsappUrl?: string | null;
};

export function FloatingActions({ whatsappUrl }: FloatingActionsProps) {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const showWhatsApp = !isAdmin && Boolean(whatsappUrl);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[90] flex flex-col-reverse items-end gap-3",
        "right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:right-5 sm:bottom-5",
      )}
    >
      {showWhatsApp && whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile yazın"
          className="pointer-events-auto group flex items-center gap-0 rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60"
        >
          <span className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
            <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-[10rem] group-hover:pr-4 group-hover:opacity-100 group-focus-visible:max-w-[10rem] group-focus-visible:pr-4 group-focus-visible:opacity-100">
            WhatsApp
          </span>
        </a>
      )}

      {showTop && (
        <button
          type="button"
          aria-label="Sayfanın başına dön"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-espresso/15 bg-cream/95 text-espresso shadow-[0_10px_28px_-12px_rgba(59,46,38,0.45)] backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 sm:h-12 sm:w-12"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden
          >
            <path
              d="M12 19V5M5 12l7-7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
