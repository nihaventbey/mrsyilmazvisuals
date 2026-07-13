"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { SiteLogo } from "@/components/ui/SiteLogo";
import { cn } from "@/lib/utils";

export function Header({
  siteName,
  logoSrc,
}: {
  siteName: string;
  logoSrc: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const mobileMenu =
    open && mounted
      ? createPortal(
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Mobil menü"
            className="fixed inset-0 z-[300] flex flex-col bg-cream lg:hidden"
          >
            <div className="container-page grid h-16 shrink-0 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 sm:h-20 md:h-24">
              <div aria-hidden />
              <SiteLogo
                src={logoSrc}
                name={siteName}
                variant="wordmark"
                showName={false}
                href="/"
                className="min-w-0 justify-center justify-self-center"
                imageClassName="mx-auto max-h-10 max-w-full object-center sm:max-h-14 md:max-h-16"
              />
              <button
                type="button"
                aria-label="Menüyü kapat"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center justify-self-end"
              >
                <span className="relative block h-4 w-6">
                  <span className="absolute left-0 top-1/2 block h-px w-6 -translate-y-1/2 rotate-45 bg-espresso" />
                  <span className="absolute left-0 top-1/2 block h-px w-6 -translate-y-1/2 -rotate-45 bg-espresso" />
                </span>
              </button>
            </div>
            <nav className="container-page flex flex-1 flex-col gap-1 overflow-y-auto pb-10 sm:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-b border-espresso/10 py-3.5 font-serif text-xl text-espresso sm:py-4 sm:text-2xl"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                href="/rezervasyon"
                size="lg"
                className="mt-6 w-full sm:w-auto"
                onClick={() => setOpen(false)}
              >
                Rezervasyon Oluştur
              </Button>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[200] transition-all duration-300",
          scrolled || open
            ? "bg-cream/95 shadow-sm backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div
          className={cn(
            "container-page grid h-16 items-center gap-2 sm:h-20 md:h-24",
            "grid-cols-[2.5rem_minmax(0,1fr)_2.5rem]",
            "lg:flex lg:justify-between lg:gap-3",
          )}
        >
          <div className="lg:hidden" aria-hidden />

          <SiteLogo
            src={logoSrc}
            name={siteName}
            variant="wordmark"
            showName={false}
            className="min-w-0 justify-center justify-self-center lg:justify-start lg:justify-self-auto"
            imageClassName="mx-auto max-h-10 max-w-full object-center sm:max-h-14 md:max-h-16 lg:mx-0 lg:max-h-20 lg:max-w-[min(420px,40vw)] lg:object-left"
          />

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-sm tracking-wide transition-colors",
                    active
                      ? "text-espresso"
                      : "text-mocha hover:text-espresso",
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 h-px w-full bg-gold" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <Button href="/rezervasyon" size="sm">
              Rezervasyon
            </Button>
          </div>

          <button
            type="button"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="relative z-[210] flex h-10 w-10 shrink-0 items-center justify-center justify-self-end lg:hidden"
          >
            <span className="relative block h-4 w-6">
              <span
                className={cn(
                  "absolute left-0 top-0 block h-px w-6 bg-espresso transition-all",
                  open && "top-1/2 translate-y-[-50%] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 block h-px w-6 -translate-y-1/2 bg-espresso transition-all",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 block h-px w-6 bg-espresso transition-all",
                  open && "bottom-auto top-1/2 translate-y-[-50%] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
