import { cache } from "react";
import {
  createPublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";

export type MaintenanceSettings = {
  enabled: boolean;
  title: string;
  message: string;
};

export const defaultMaintenanceSettings: MaintenanceSettings = {
  enabled: false,
  title: "Kısa süreliğine bakımdayız",
  message:
    "Sitemizi sizin için yeniliyoruz. Çok yakında tekrar buradayız. Acil sorularınız için Instagram üzerinden bize ulaşabilirsiniz.",
};

export function isMaintenanceForced(): boolean {
  return process.env.MAINTENANCE_MODE === "true";
}

/** Lightweight check for proxy.ts — no React cache. */
export async function fetchMaintenanceEnabled(): Promise<boolean> {
  if (isMaintenanceForced()) return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return false;

  try {
    const res = await fetch(
      `${url}/rest/v1/site_settings?key=eq.maintenance&select=value`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 10 },
      },
    );
    if (!res.ok) return false;
    const rows = (await res.json()) as { value?: { enabled?: boolean } }[];
    return rows[0]?.value?.enabled === true;
  } catch {
    return false;
  }
}

export const getMaintenanceSettings = cache(
  async (): Promise<MaintenanceSettings> => {
    if (!isSupabaseConfigured()) return defaultMaintenanceSettings;

    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance")
      .maybeSingle();

    if (!data?.value || typeof data.value !== "object") {
      return defaultMaintenanceSettings;
    }

    return {
      ...defaultMaintenanceSettings,
      ...(data.value as Partial<MaintenanceSettings>),
    };
  },
);

export async function isMaintenanceActive(): Promise<boolean> {
  if (isMaintenanceForced()) return true;
  const settings = await getMaintenanceSettings();
  return settings.enabled;
}
