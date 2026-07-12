import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import { signOut } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

const adminLinks = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/ayarlar", label: "Site Ayarları" },
  { href: "/admin/kategoriler", label: "Kategoriler" },
  { href: "/admin/portfolyo", label: "Portfolyo" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/sss", label: "SSS" },
  { href: "/admin/rezervasyonlar", label: "Rezervasyonlar" },
  { href: "/admin/mesajlar", label: "Mesajlar" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <div className="min-h-screen">{children}</div>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-espresso/10 bg-sand/40 p-6 lg:flex">
        <Link href="/admin" className="font-serif text-lg text-espresso">
          Yönetim Paneli
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-mocha transition-colors hover:bg-espresso/5 hover:text-espresso"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-espresso/10 pt-4">
          <p className="truncate text-xs text-mist">{user.email}</p>
          <Link
            href="/"
            className="block text-sm text-mocha transition-colors hover:text-espresso"
          >
            ← Siteye Dön
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-red-700 transition-colors hover:text-red-900"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <div className="border-b border-espresso/10 bg-sand/30 px-4 py-3 lg:hidden">
          <nav className="flex flex-wrap gap-2 text-xs">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-espresso/20 px-3 py-1.5 text-mocha"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
