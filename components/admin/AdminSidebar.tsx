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
  { href: "/admin/reklamlar", label: "Reklamlar" },
  { href: "/admin/cekilis", label: "Çekiliş" },
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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        d="M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminSidebar({
  email,
  siteName,
  logoSrc,
  instagramUrl,
  contactEmail,
}: {
  email: string;
  siteName: string;
  logoSrc: string;
  logoIconSrc?: string;
  instagramUrl?: string;
  contactEmail?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-espresso/10 bg-sand/95 backdrop-blur-sm lg:flex">
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="shrink-0 border-b border-espresso/10 px-3 py-5">
            <Link
              href="/admin"
              className="block text-center transition-opacity hover:opacity-85"
              aria-label={`${siteName} yönetim paneli`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={siteName}
                className="mx-auto h-auto w-full max-h-28 object-contain object-center"
              />
              <p className="mt-3 text-center text-[10px] font-medium tracking-[0.22em] text-gold-dark uppercase">
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

          <div className="mt-auto shrink-0 space-y-3 border-t border-espresso/10 px-3 py-4">
            <div>
              <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-dark">
                Hızlı Erişim
              </p>
              <div className="flex flex-col gap-0.5">
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-mocha transition-colors hover:bg-espresso/5 hover:text-espresso"
                  >
                    <InstagramIcon className="h-4 w-4 shrink-0" />
                    Instagram
                  </a>
                ) : null}
                <Link
                  href="/"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-mocha transition-colors hover:bg-espresso/5 hover:text-espresso"
                >
                  <HomeIcon className="h-4 w-4 shrink-0" />
                  Siteye Dön
                </Link>
                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-mocha transition-colors hover:bg-espresso/5 hover:text-espresso"
                  >
                    <MailIcon className="h-4 w-4 shrink-0" />
                    E-posta
                  </a>
                ) : null}
              </div>
            </div>

            <div className="border-t border-espresso/10 px-2 pt-3">
              <p className="truncate text-xs text-mist">{email}</p>
              <form action={signOut} className="mt-2">
                <button
                  type="submit"
                  className="cursor-pointer text-sm text-red-700 transition-colors hover:text-red-900"
                >
                  Çıkış Yap
                </button>
              </form>
            </div>
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
