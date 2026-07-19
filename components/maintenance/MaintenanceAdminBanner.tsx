"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/**
 * Logged-in admins bypass the maintenance redirect in proxy.ts, so the site
 * looks normal to them even while visitors only see /bakim. This banner makes
 * the active maintenance state visible to the admin on public pages.
 *
 * Runs entirely client-side so public pages stay statically cacheable.
 */
export function MaintenanceAdminBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session || cancelled) return;

        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "maintenance")
          .maybeSingle();

        const enabled =
          (data?.value as { enabled?: boolean } | null)?.enabled === true;
        if (!cancelled && enabled) setVisible(true);
      } catch {
        // Banner is informational only; stay hidden on any failure.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-300 bg-amber-50/95 px-4 py-3 text-center text-sm text-amber-950 backdrop-blur-sm">
      <span className="font-medium">Bakım modu aktif.</span> Ziyaretçiler
      yalnızca bakım sayfasını görüyor; siz admin olduğunuz için siteyi normal
      görüyorsunuz.{" "}
      <Link
        href="/admin/ayarlar"
        className="font-medium underline underline-offset-2"
      >
        Bakım ayarları
      </Link>
    </div>
  );
}
