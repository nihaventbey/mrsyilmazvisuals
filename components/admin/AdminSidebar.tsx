"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/ayarlar", label: "Site Ayarları" },
  { href: "/admin/hero", label: "Hero Kartları" },
  { href: "/admin/instagram", label: "Instagram" },
  { href: "/admin/kategoriler", label: "Kategoriler" },
  { href: "/admin/portfolyo", label: "Portfolyo" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/sss", label: "SSS" },
  { href: "/admin/rezervasyonlar", label: "Rezervasyonlar" },
  { href: "/admin/mesajlar", label: "Mesajlar" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  email,
  siteName,
  logoSrc,
}: {
  email: string;
  siteName: string;
  logoSrc: string;
  logoIconSrc?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-espresso/10 bg-sand/95 backdrop-blur-sm lg:flex">
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="shrink-0 border-b border-espresso/10 px-3 py-5">
            <Link
              href="/admin"
              className="block transition-opacity hover:opacity-85"
              aria-label={`${siteName} yönetim paneli`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={siteName}
                className="h-auto w-full max-h-28 object-contain object-left"
              />
              <p className="mt-3 text-[10px] font-medium tracking-[0.22em] text-gold-dark uppercase">
                Yönetim Paneli
              </p>
            </Link>
          </div>

          <nav className="mt-4 flex flex-1 flex-col gap-0.5 px-3 pb-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive(pathname, link.href)
                    ? "bg-espresso/8 font-medium text-espresso"
                    : "text-mocha hover:bg-espresso/5 hover:text-espresso",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto shrink-0 space-y-2 border-t border-espresso/10 px-5 py-4">
            <p className="truncate text-xs text-mist">{email}</p>
            <Link
              href="/"
              className="block text-sm text-mocha transition-colors hover:text-espresso"
            >
              ← Siteye Dön
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="cursor-pointer text-sm text-red-700 transition-colors hover:text-red-900"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-30 border-b border-espresso/10 bg-sand/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-3 border-b border-espresso/5 px-3 py-2.5 sm:px-4 sm:py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={siteName}
            className="h-8 w-auto max-w-[min(160px,55vw)] object-contain object-left sm:h-9 sm:max-w-[180px]"
          />
          <p className="shrink-0 text-[10px] tracking-[0.18em] text-gold-dark uppercase">
            Yönetim
          </p>
        </div>
        <nav className="-mx-0 flex gap-2 overflow-x-auto overscroll-x-contain px-3 py-2.5 text-xs whitespace-nowrap [scrollbar-width:none] sm:px-4 sm:py-3 [&::-webkit-scrollbar]:hidden">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 transition-colors",
                isActive(pathname, link.href)
                  ? "border-espresso/30 bg-espresso/8 text-espresso"
                  : "border-espresso/20 text-mocha",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
