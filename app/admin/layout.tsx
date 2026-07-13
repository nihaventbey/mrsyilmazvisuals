import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import { getSiteConfig, getSiteSettings } from "@/lib/settings";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

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

  const [config, settings] = await Promise.all([
    getSiteConfig(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-cream">
      <AdminSidebar
        email={user.email ?? ""}
        siteName={config.name}
        logoSrc={config.logoImage}
        logoIconSrc={config.logoIcon}
        instagramUrl={settings.contact.instagramUrl}
        contactEmail={process.env.CONTACT_EMAIL?.trim() || undefined}
      />
      <div className="lg:pl-64">
        <main className="overflow-x-hidden p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
