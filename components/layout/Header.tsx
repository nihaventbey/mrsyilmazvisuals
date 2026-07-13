"use client";

import { useEffect, useState } from "react";
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/90 shadow-sm backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-20 md:h-24">
        <SiteLogo
          src={logoSrc}
          name={siteName}
          variant="wordmark"
          showName={false}
          className="min-w-0"
          imageClassName="max-h-10 max-w-[min(200px,55vw)] sm:max-h-14 sm:max-w-[min(280px,50vw)] md:max-h-20 md:max-w-[min(420px,40vw)]"
        />

        <nav className="hidden items-center gap-6 xl:gap-8 lg:flex">
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
          aria-label="Menüyü aç"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={cn(
              "h-px w-6 bg-espresso transition-all",
              open && "translate-y-[7px] rotate-45",
            )}
          />
          <span
            className={cn(
              "h-px w-6 bg-espresso transition-all",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "h-px w-6 bg-espresso transition-all",
              open && "-translate-y-[7px] -rotate-45",
            )}
          />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-16 z-40 overflow-y-auto bg-cream sm:top-20 md:top-24 lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-6 sm:gap-2 sm:py-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-espresso/10 py-3.5 font-serif text-xl text-espresso sm:py-4 sm:text-2xl"
              >
                {link.label}
              </Link>
            ))}
            <Button href="/rezervasyon" size="lg" className="mt-6 w-full sm:w-auto">
              Rezervasyon Oluştur
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
