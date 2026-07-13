import { cache } from "react";
import { defaultLegalSettings, type LegalSettings } from "@/lib/legal-defaults";
import {
  createPublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";

function mergeLegal(value: unknown): LegalSettings {
  if (!value || typeof value !== "object") return defaultLegalSettings;
  const partial = value as Partial<LegalSettings>;
  return {
    ...defaultLegalSettings,
    ...partial,
    sections: partial.sections?.length ? partial.sections : defaultLegalSettings.sections,
  };
}

export const getLegalSettings = cache(async (): Promise<LegalSettings> => {
  if (!isSupabaseConfigured()) return defaultLegalSettings;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "legal")
    .maybeSingle();

  return mergeLegal(data?.value);
});

export type { LegalSection, LegalSettings } from "@/lib/legal-defaults";
