import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/content";
import { getMaintenanceSettings, isMaintenanceForced } from "@/lib/maintenance";
import { getBookableCategories } from "@/lib/portfolio-categories";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const maintenance = await getMaintenanceSettings();
  const maintenanceActive = isMaintenanceForced() || maintenance.enabled;

  const [images, posts, bookings, messages, recentBookings, bookable] =
    await Promise.all([
      supabase
        .from("portfolio_images")
        .select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
      supabase
        .from("bookings")
        .select("id, name, shoot_type, preferred_date, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      getBookableCategories(),
    ]);

  const stats = [
    { label: "Portfolyo Görseli", value: images.count ?? 0, href: "/admin/portfolyo" },
    { label: "Blog Yazısı", value: posts.count ?? 0, href: "/admin/blog" },
    { label: "Yeni Rezervasyon", value: bookings.count ?? 0, href: "/admin/rezervasyonlar" },
    { label: "Okunmamış Mesaj", value: messages.count ?? 0, href: "/admin/mesajlar" },
  ];

  const typeLabels = Object.fromEntries(
    bookable.map((c) => [c.slug, c.title]),
  );

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Genel Bakış</h1>

      {maintenanceActive && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-medium">Bakım modu aktif</p>
          <p className="mt-1 text-amber-900/80">
            Ziyaretçiler siteyi göremiyor. Yönetim panelinden kapatabilirsiniz.
          </p>
          <Link
            href="/admin/ayarlar"
            className="mt-3 inline-block text-sm font-medium text-amber-950 underline underline-offset-2"
          >
            Bakım ayarlarına git
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-espresso/10 bg-white/50 p-5 transition-shadow hover:shadow-md"
          >
            <p className="font-serif text-3xl text-espresso">{stat.value}</p>
            <p className="mt-1 text-sm text-mocha">{stat.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 font-serif text-xl text-espresso">
        Son Rezervasyon Talepleri
      </h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-espresso/10 bg-white/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs uppercase tracking-wider text-mist">
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">Tür</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Durum</th>
            </tr>
          </thead>
          <tbody>
            {(recentBookings.data ?? []).map((booking) => (
              <tr key={booking.id} className="border-b border-espresso/5">
                <td className="px-4 py-3 text-espresso">{booking.name}</td>
                <td className="px-4 py-3 text-mocha">
                  {typeLabels[booking.shoot_type] ?? booking.shoot_type}
                </td>
                <td className="px-4 py-3 text-mocha">
                  {formatDate(booking.preferred_date)}
                </td>
                <td className="px-4 py-3 text-mocha">{booking.status}</td>
              </tr>
            ))}
            {(recentBookings.data ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-mist">
                  Henüz rezervasyon talebi yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
