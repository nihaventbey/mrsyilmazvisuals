import { cache } from "react";
import { defaultSettings } from "@/lib/settings-defaults";
import {
  createPublicClient,
  isSupabaseConfigured,
  storagePublicUrl,
} from "@/lib/supabase/public";

export type TimelineItem = {
  year: string;
  title: string;
  text: string;
};

export type ValueItem = {
  title: string;
  text: string;
};

export type GeneralSettings = {
  name: string;
  tagline: string;
  description: string;
  author: string;
  logoImage: string;
  logoIcon: string;
  profileImage: string;
  url: string;
};

export type ContactSettings = {
  location: string;
  workingHours: string;
  instagramHandle: string;
  instagramUrl: string;
  pageTitle: string;
  pageDescription: string;
  formNote: string;
};

export type AboutSettings = {
  pageDescription: string;
  aboutImage: string;
  bioParagraphs: string[];
  previewParagraphs: string[];
  timeline: TimelineItem[];
  values: ValueItem[];
};

export type HomeSettings = {
  servicesEyebrow: string;
  servicesTitle: string;
  servicesDescription: string;
  ctaTitle: string;
  ctaDescription: string;
};

export type SiteSettings = {
  general: GeneralSettings;
  contact: ContactSettings;
  about: AboutSettings;
  home: HomeSettings;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  author: string;
  logoImage: string;
  logoIcon: string;
  aboutImage: string;
  profileImage: string;
  location: string;
  workingHours: string;
};

export type ContactChannel = {
  label: string;
  value: string;
  href?: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
};

function mergeSection<T extends object>(defaults: T, value: unknown): T {
  if (!value || typeof value !== "object") return defaults;
  return { ...defaults, ...(value as Partial<T>) };
}

function resolveImageUrl(path: string | undefined, fallback: string): string {
  const value = String(path ?? "").trim();
  if (!value) return fallback;
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return storagePublicUrl("site", value) ?? fallback;
}

async function fetchSettingsRows(): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error || !data) return {};

  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await fetchSettingsRows();

  return {
    general: mergeSection(defaultSettings.general, rows.general),
    contact: mergeSection(defaultSettings.contact, rows.contact),
    about: mergeSection(defaultSettings.about, rows.about),
    home: mergeSection(defaultSettings.home, rows.home),
  };
});

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const settings = await getSiteSettings();

  const logoImage = resolveImageUrl(
    settings.general.logoImage,
    defaultSettings.general.logoImage,
  );
  const logoIcon = resolveImageUrl(
    settings.general.logoIcon,
    defaultSettings.general.logoIcon,
  );
  const aboutImage = resolveImageUrl(
    settings.about.aboutImage,
    defaultSettings.about.aboutImage,
  );

  return {
    name: settings.general.name,
    tagline: settings.general.tagline,
    description: settings.general.description,
    url: settings.general.url,
    author: settings.general.author,
    logoImage,
    logoIcon,
    aboutImage,
    profileImage: aboutImage,
    location: settings.contact.location,
    workingHours: settings.contact.workingHours,
  };
});

export const getContactChannels = cache(async (): Promise<ContactChannel[]> => {
  const settings = await getSiteSettings();
  const { contact } = settings;

  return [
    {
      label: "Instagram",
      value: contact.instagramHandle,
      href: contact.instagramUrl,
    },
    { label: "Konum", value: contact.location },
    { label: "Çalışma Saatleri", value: contact.workingHours },
  ];
});

export const getSocialLinks = cache(async (): Promise<SocialLink[]> => {
  const settings = await getSiteSettings();

  return [
    {
      label: "Instagram",
      href: settings.contact.instagramUrl,
    },
  ];
});

export const getServices = cache(async (): Promise<Service[]> => {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("slug, title, short, description")
      .order("sort_order");

    if (!error && data && data.length > 0) {
      return data.map((category) => ({
        slug: category.slug,
        title: category.title,
        short: category.short || category.title,
        description: category.description,
      }));
    }
  }

  return [
    {
      slug: "dogum",
      title: "Doğum Fotoğrafçılığı",
      short: "Hayatın başladığı an",
      description: defaultSettings.general.description,
    },
    {
      slug: "hamile",
      title: "Hamile Çekimleri",
      short: "Bekleyişin zarafeti",
      description: "Annelik yolculuğunuzun en özel dönemini samimi, rahat ve doğal pozlarla ölümsüzleştiriyorum.",
    },
    {
      slug: "bebek",
      title: "Bebek & Yenidoğan Çekimleri",
      short: "İlk günlerin masumiyeti",
      description: "Yenidoğan ve bebek çekimlerinde konfor ve güvenlik önceliğim.",
    },
    {
      slug: "dugun",
      title: "Düğün Çekimleri",
      short: "Sonsuza dair bir söz",
      description: "Düğün gününüzün telaşını, coşkusunu ve zarafetini hikâye anlatan karelerle yakalıyorum.",
    },
  ];
});

export function splitParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseTimeline(value: string): TimelineItem[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [year = "", title = "", ...rest] = line.split("|").map((s) => s.trim());
      return { year, title, text: rest.join("|").trim() };
    })
    .filter((item) => item.year && item.title);
}

export function parseValues(value: string): ValueItem[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Desteklenen ayırıcılar: | — - :
      const parts = line.includes("|")
        ? line.split("|")
        : line.includes("—")
          ? line.split("—")
          : line.includes(" - ")
            ? line.split(" - ")
            : line.includes(":")
              ? line.split(":")
              : [line];

      const title = String(parts[0] ?? "").trim();
      const text = parts
        .slice(1)
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ")
        .trim();
      return { title, text };
    })
    .filter((item) => item.title && item.text);
}

export function formatTimeline(items: TimelineItem[]): string {
  return items.map((item) => `${item.year} | ${item.title} | ${item.text}`).join("\n");
}

export function formatValues(items: ValueItem[]): string {
  return items.map((item) => `${item.title} | ${item.text}`).join("\n");
}

export function formatParagraphs(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}
