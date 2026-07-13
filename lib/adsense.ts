import { cache } from "react";
import {
  ADSENSE_SLOT_META,
  defaultAdSenseSettings,
  normalizePublisherId,
  toAdsTxtPublisherId,
  type AdSenseSettings,
  type AdSenseSlotConfig,
  type AdSenseSlotId,
} from "@/lib/adsense-defaults";
import {
  createPublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";

export type {
  AdSenseSettings,
  AdSenseSlotConfig,
  AdSenseSlotId,
} from "@/lib/adsense-defaults";
export { ADSENSE_SLOT_META, toAdsTxtPublisherId } from "@/lib/adsense-defaults";

function mergeSlot(
  defaults: AdSenseSlotConfig,
  value: unknown,
): AdSenseSlotConfig {
  if (!value || typeof value !== "object") return defaults;
  const row = value as Partial<AdSenseSlotConfig>;
  return {
    enabled: row.enabled === true,
    slotId: String(row.slotId ?? defaults.slotId).trim(),
  };
}

function mergeAdSenseSettings(value: unknown): AdSenseSettings {
  if (!value || typeof value !== "object") return defaultAdSenseSettings;
  const raw = value as Record<string, unknown>;

  const slots = { ...defaultAdSenseSettings.slots };
  const incoming = raw.slots;
  if (incoming && typeof incoming === "object") {
    for (const key of Object.keys(slots) as AdSenseSlotId[]) {
      slots[key] = mergeSlot(
        defaultAdSenseSettings.slots[key],
        (incoming as Record<string, unknown>)[key],
      );
    }
  }

  const enabledRaw = raw.enabled;
  const testModeRaw = raw.testMode;

  return {
    enabled: enabledRaw === true || enabledRaw === "true",
    publisherId: normalizePublisherId(
      String(raw.publisherId ?? defaultAdSenseSettings.publisherId),
    ),
    testMode:
      testModeRaw === true ||
      testModeRaw === "true" ||
      (testModeRaw == null && defaultAdSenseSettings.testMode),
    slots,
  };
}

export const getAdSenseSettings = cache(async (): Promise<AdSenseSettings> => {
  if (!isSupabaseConfigured()) return defaultAdSenseSettings;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "adsense")
    .maybeSingle();

  return mergeAdSenseSettings(data?.value);
});

export async function getActiveAdSlot(
  slot: AdSenseSlotId,
): Promise<{
  publisherId: string;
  slotId: string;
  testMode: boolean;
} | null> {
  const settings = await getAdSenseSettings();
  if (!settings.enabled || !settings.publisherId) return null;

  const config = settings.slots[slot];
  if (!config?.enabled || !config.slotId.trim()) return null;

  return {
    publisherId: settings.publisherId,
    slotId: config.slotId.trim(),
    testMode: settings.testMode,
  };
}

export async function buildAdsTxt(): Promise<string | null> {
  const settings = await getAdSenseSettings();
  if (!settings.enabled) return null;
  const pub = toAdsTxtPublisherId(settings.publisherId);
  if (!pub) return null;

  return [
    `# Mrs. Yılmaz Visuals — ads.txt`,
    `google.com, ${pub}, DIRECT, f08c47fec0942fa0`,
    "",
  ].join("\n");
}
