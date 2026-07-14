"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/validations";

import {
  parseTimeline,
  parseValues,
  splitParagraphs,
} from "@/lib/settings";
import type { HeroCard } from "@/lib/hero";
import type { InstagramPost } from "@/lib/instagram";
import {
  fetchInstagramGraphPosts,
  getInstagramGraphStatus,
} from "@/lib/instagram-graph";
import {
  normalizeInstagramUsername,
  slugifyGiveawayTitle,
} from "@/lib/giveaways";
import {
  ADSENSE_SLOT_META,
  normalizePublisherId,
  type AdSenseSlotId,
} from "@/lib/adsense-defaults";
import {
  extensionFromFilename,
  normalizeStoredImagePath,
  uploadImageFile,
} from "@/lib/storage-upload";

// ================================ auth =================================

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return {
      status: "error",
      message:
        "Supabase henüz yapılandırılmamış. Lütfen .env.local dosyasına Supabase URL ve anahtarını ekleyin.",
    };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: "Giriş başarısız. E-posta veya şifre hatalı.",
    };
  }

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/giris");
}

// ============================== helpers ================================

function revalidateSite() {
  for (const p of [
    "/",
    "/hakkimda",
    "/portfolyo",
    "/blog",
    "/sss",
    "/iletisim",
    "/cekilis",
    "/bakim",
    "/gizlilik-politikasi",
    "/ads.txt",
  ]) {
    revalidatePath(p, "layout");
  }
}

async function upsertSetting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string,
  value: Record<string, unknown>,
) {
  const { data: existing } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  const current =
    existing?.value && typeof existing.value === "object" && !Array.isArray(existing.value)
      ? (existing.value as Record<string, unknown>)
      : {};

  const { error } = await supabase.from("site_settings").upsert(
    {
      key,
      value: { ...current, ...value },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/giris");
  return supabase;
}

// ============================= portfolio ===============================

export async function addPortfolioImage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const categoryId = String(formData.get("category_id") ?? "");
  const caption = String(formData.get("caption") ?? "");
  const orientation = String(formData.get("orientation") ?? "portrait");
  const isFeatured = formData.get("is_featured") === "on";
  const file = formData.get("file") as File | null;

  if (!categoryId || !caption) {
    return { status: "error", message: "Kategori ve başlık zorunludur." };
  }

  let imagePath: string | null = null;

  if (file && file.size > 0) {
    const ext = extensionFromFilename(file.name);
    imagePath = `${categoryId}/${Date.now()}.${ext}`;
    const uploaded = await uploadImageFile(
      supabase,
      "portfolio",
      imagePath,
      file,
    );
    if (!uploaded.ok) {
      return {
        status: "error",
        message: `Görsel yüklenemedi: ${uploaded.error}`,
      };
    }
  }

  const { error } = await supabase.from("portfolio_images").insert({
    category_id: categoryId,
    caption,
    orientation,
    is_featured: isFeatured,
    image_path: imagePath,
  });

  if (error) {
    return { status: "error", message: `Kaydedilemedi: ${error.message}` };
  }

  revalidateSite();
  revalidatePath("/admin/portfolyo");
  return { status: "success", message: "Görsel eklendi." };
}

export async function uploadPortfolioImages(
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const categoryId = String(formData.get("category_id") ?? "");
  const isFeatured = formData.get("is_featured") === "on";
  const files = formData.getAll("files").filter((f) => f instanceof File && f.size > 0) as File[];

  let meta: Array<{ caption: string; orientation: string }> = [];
  try {
    meta = JSON.parse(String(formData.get("meta") ?? "[]"));
  } catch {
    return { status: "error", message: "Görsel bilgileri okunamadı." };
  }

  if (!categoryId) {
    return { status: "error", message: "Kategori seçin." };
  }
  if (files.length === 0) {
    return { status: "error", message: "En az bir görsel seçin." };
  }

  const { data: lastImage } = await supabase
    .from("portfolio_images")
    .select("sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrder = (lastImage?.sort_order ?? 0) + 1;
  let uploaded = 0;
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const info = meta[i] ?? { caption: file.name, orientation: "portrait" };
    const caption = String(info.caption || file.name).trim();
    const orientation =
      info.orientation === "landscape" ? "landscape" : "portrait";
    const ext = extensionFromFilename(file.name);
    const imagePath = `${categoryId}/${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploadResult = await uploadImageFile(
      supabase,
      "portfolio",
      imagePath,
      file,
    );

    if (!uploadResult.ok) {
      errors.push(`${file.name}: ${uploadResult.error}`);
      continue;
    }

    const { error: insertError } = await supabase
      .from("portfolio_images")
      .insert({
        category_id: categoryId,
        caption,
        orientation,
        is_featured: isFeatured,
        image_path: imagePath,
        sort_order: nextOrder++,
      });

    if (insertError) {
      await supabase.storage.from("portfolio").remove([imagePath]);
      errors.push(`${file.name}: ${insertError.message}`);
      continue;
    }

    uploaded++;
  }

  revalidateSite();
  revalidatePath("/admin/portfolyo");

  if (uploaded === 0) {
    return {
      status: "error",
      message: errors[0] ?? "Hiçbir görsel yüklenemedi.",
    };
  }

  if (errors.length > 0) {
    return {
      status: "success",
      message: `${uploaded} görsel yüklendi. ${errors.length} dosyada hata oluştu.`,
    };
  }

  return {
    status: "success",
    message: `${uploaded} görsel başarıyla yüklendi.`,
  };
}

export async function deletePlaceholderImages(): Promise<void> {
  const supabase = await authedClient();
  await supabase
    .from("portfolio_images")
    .delete()
    .is("image_path", null);
  revalidateSite();
  revalidatePath("/admin/portfolyo");
}

export async function updatePortfolioImage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const id = String(formData.get("id") ?? "");
  const caption = String(formData.get("caption") ?? "");
  const orientation = String(formData.get("orientation") ?? "portrait");
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const file = formData.get("file") as File | null;
  const currentPath = String(formData.get("image_path") ?? "");

  if (!id || !caption) {
    return { status: "error", message: "Başlık zorunludur." };
  }

  let imagePath = currentPath || null;

  if (file && file.size > 0) {
    const ext = extensionFromFilename(file.name);
    const nextPath = `${id}/${Date.now()}.${ext}`;
    const uploaded = await uploadImageFile(
      supabase,
      "portfolio",
      nextPath,
      file,
    );
    if (!uploaded.ok) {
      return {
        status: "error",
        message: `Görsel yüklenemedi: ${uploaded.error}`,
      };
    }
    imagePath = nextPath;
    if (currentPath && currentPath !== nextPath) {
      await supabase.storage.from("portfolio").remove([currentPath]);
    }
  }

  const { error } = await supabase
    .from("portfolio_images")
    .update({
      caption,
      orientation,
      sort_order: sortOrder,
      image_path: imagePath,
    })
    .eq("id", id);

  if (error) {
    return { status: "error", message: `Kaydedilemedi: ${error.message}` };
  }

  revalidateSite();
  revalidatePath("/admin/portfolyo");
  return { status: "success", message: "Görsel güncellendi." };
}

export async function deletePortfolioImage(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  const id = String(formData.get("id") ?? "");
  const imagePath = String(formData.get("image_path") ?? "");

  if (imagePath) {
    await supabase.storage.from("portfolio").remove([imagePath]);
  }
  await supabase.from("portfolio_images").delete().eq("id", id);

  revalidateSite();
  revalidatePath("/admin/portfolyo");
}

export async function toggleFeatured(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";

  await supabase
    .from("portfolio_images")
    .update({ is_featured: next })
    .eq("id", id);

  revalidateSite();
  revalidatePath("/admin/portfolyo");
}

// ================================ blog =================================

export async function upsertBlogPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const id = String(formData.get("id") ?? "");
  const payload = {
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    category: String(formData.get("category") ?? "Genel"),
    published: formData.get("published") === "on",
    published_at:
      formData.get("published") === "on" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (!payload.slug || !payload.title) {
    return { status: "error", message: "Başlık ve slug zorunludur." };
  }

  const { error } = id
    ? await supabase.from("blog_posts").update(payload).eq("id", id)
    : await supabase.from("blog_posts").insert(payload);

  if (error) {
    return { status: "error", message: `Kaydedilemedi: ${error.message}` };
  }

  revalidateSite();
  revalidatePath("/admin/blog");
  return { status: "success", message: "Yazı kaydedildi." };
}

export async function deleteBlogPost(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  await supabase
    .from("blog_posts")
    .delete()
    .eq("id", String(formData.get("id") ?? ""));
  revalidateSite();
  revalidatePath("/admin/blog");
}

// ============================== bookings ===============================

export async function upsertFaq(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const id = String(formData.get("id") ?? "");
  const payload = {
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (!payload.question || !payload.answer) {
    return { status: "error", message: "Soru ve cevap zorunludur." };
  }

  const { error } = id
    ? await supabase.from("faq_items").update(payload).eq("id", id)
    : await supabase.from("faq_items").insert(payload);

  if (error) {
    return { status: "error", message: `Kaydedilemedi: ${error.message}` };
  }

  revalidateSite();
  revalidatePath("/admin/sss");
  return { status: "success", message: "Soru kaydedildi." };
}

export async function deleteFaq(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  await supabase
    .from("faq_items")
    .delete()
    .eq("id", String(formData.get("id") ?? ""));
  revalidateSite();
  revalidatePath("/admin/sss");
}

// ============================== bookings ===============================

export async function updateBookingStatus(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  await supabase
    .from("bookings")
    .update({ status: String(formData.get("status") ?? "new") })
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/admin/rezervasyonlar");
}

export async function deleteBooking(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  await supabase
    .from("bookings")
    .delete()
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/admin/rezervasyonlar");
}

// ============================== messages ===============================

export async function toggleMessageRead(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  await supabase
    .from("contact_messages")
    .update({ is_read: formData.get("next") === "true" })
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/admin/mesajlar");
}

export async function deleteMessage(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  await supabase
    .from("contact_messages")
    .delete()
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/admin/mesajlar");
}

// ============================== settings ===============================

export async function saveLogoSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const logoFile = formData.get("logo_file") as File | null;
  const logoIconFile = formData.get("logo_icon_file") as File | null;
  const patch: Record<string, unknown> = {};

  if (logoFile && logoFile.size > 0) {
    const ext = extensionFromFilename(logoFile.name, "png");
    const logoImage = `logo/wordmark-${Date.now()}.${ext}`;
    const uploaded = await uploadImageFile(
      supabase,
      "site",
      logoImage,
      logoFile,
      { upsert: true },
    );
    if (!uploaded.ok) {
      return {
        status: "error",
        message: `Üst menü logosu yüklenemedi: ${uploaded.error}`,
      };
    }
    patch.logoImage = logoImage;
  }

  if (logoIconFile && logoIconFile.size > 0) {
    const ext = extensionFromFilename(logoIconFile.name, "png");
    const logoIcon = `logo/icon-${Date.now()}.${ext}`;
    const uploaded = await uploadImageFile(
      supabase,
      "site",
      logoIcon,
      logoIconFile,
      { upsert: true },
    );
    if (!uploaded.ok) {
      return {
        status: "error",
        message: `İkon logosu yüklenemedi: ${uploaded.error}`,
      };
    }
    patch.logoIcon = logoIcon;
  }

  if (Object.keys(patch).length === 0) {
    return { status: "error", message: "Yeni bir logo dosyası seçin." };
  }

  try {
    await upsertSetting(supabase, "general", patch);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/ayarlar");
  return { status: "success", message: "Logolar kaydedildi." };
}

export async function saveGeneralSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();

  try {
    await upsertSetting(supabase, "general", {
      name: String(formData.get("name") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      description: String(formData.get("description") ?? ""),
      author: String(formData.get("author") ?? ""),
      url: String(formData.get("url") ?? ""),
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/ayarlar");
  return { status: "success", message: "Genel ayarlar kaydedildi." };
}

export async function saveContactSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();

  try {
    await upsertSetting(supabase, "contact", {
      location: String(formData.get("location") ?? ""),
      mapsUrl: String(formData.get("maps_url") ?? "").trim(),
      whatsappPhone: String(formData.get("whatsapp_phone") ?? "").trim(),
      workingHours: String(formData.get("working_hours") ?? ""),
      instagramHandle: String(formData.get("instagram_handle") ?? ""),
      instagramUrl: String(formData.get("instagram_url") ?? ""),
      pageTitle: String(formData.get("page_title") ?? ""),
      pageDescription: String(formData.get("page_description") ?? ""),
      formNote: String(formData.get("form_note") ?? ""),
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/ayarlar");
  return { status: "success", message: "İletişim ayarları kaydedildi." };
}

export async function saveAboutImageSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const aboutFile = formData.get("about_image_file") as File | null;

  if (!aboutFile || aboutFile.size === 0) {
    return { status: "error", message: "Yeni bir portre fotoğrafı seçin." };
  }

  const ext = extensionFromFilename(aboutFile.name);
  const aboutImage = `about/${Date.now()}.${ext}`;
  const uploaded = await uploadImageFile(
    supabase,
    "site",
    aboutImage,
    aboutFile,
    { upsert: true },
  );
  if (!uploaded.ok) {
    return {
      status: "error",
      message: `Hakkımda görseli yüklenemedi: ${uploaded.error}`,
    };
  }

  try {
    await upsertSetting(supabase, "about", { aboutImage });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/ayarlar");
  return { status: "success", message: "Hakkımda görseli kaydedildi." };
}

export async function saveAboutSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();

  const values = parseValues(String(formData.get("values") ?? ""));
  if (values.length === 0) {
    return {
      status: "error",
      message:
        "Değerler boş kaydedilemez. Her satır: Başlık | Açıklama formatında olmalı.",
    };
  }

  try {
    await upsertSetting(supabase, "about", {
      pageDescription: String(formData.get("page_description") ?? ""),
      bioParagraphs: splitParagraphs(String(formData.get("bio_paragraphs") ?? "")),
      previewParagraphs: splitParagraphs(
        String(formData.get("preview_paragraphs") ?? ""),
      ),
      timeline: parseTimeline(String(formData.get("timeline") ?? "")),
      values,
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/ayarlar");
  return { status: "success", message: "Hakkımda içeriği kaydedildi." };
}

export async function saveHomeSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();

  try {
    await upsertSetting(supabase, "home", {
      servicesEyebrow: String(formData.get("services_eyebrow") ?? ""),
      servicesTitle: String(formData.get("services_title") ?? ""),
      servicesDescription: String(formData.get("services_description") ?? ""),
      ctaTitle: String(formData.get("cta_title") ?? ""),
      ctaDescription: String(formData.get("cta_description") ?? ""),
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/ayarlar");
  return { status: "success", message: "Ana sayfa ayarları kaydedildi." };
}

export async function saveMaintenanceSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();

  try {
    await upsertSetting(supabase, "maintenance", {
      enabled: formData.get("enabled") === "on",
      title: String(formData.get("title") ?? ""),
      message: String(formData.get("message") ?? ""),
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/ayarlar");
  revalidatePath("/admin");
  return { status: "success", message: "Bakım modu ayarları kaydedildi." };
}

// ================================ hero =================================

export async function saveHeroSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();

  let cards: HeroCard[];
  try {
    cards = JSON.parse(String(formData.get("cards_json") ?? "[]")) as HeroCard[];
  } catch {
    return { status: "error", message: "Kart verisi okunamadı." };
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return { status: "error", message: "En az bir hero kartı olmalı." };
  }

  const updatedCards: HeroCard[] = [];

  for (const card of cards) {
    const caption = String(card.caption ?? "").trim();
    if (!caption) {
      return { status: "error", message: "Tüm kartların başlığı dolu olmalı." };
    }

    let image = normalizeStoredImagePath(String(card.image ?? ""), "site");

    const file = formData.get(`image_${card.id}`) as File | null;
    if (file && file.size > 0) {
      const ext = extensionFromFilename(file.name);
      const nextImage = `hero/${card.id}.${ext}`;
      const uploaded = await uploadImageFile(
        supabase,
        "site",
        nextImage,
        file,
        { upsert: true },
      );
      if (!uploaded.ok) {
        return {
          status: "error",
          message: `Görsel yüklenemedi (${caption}): ${uploaded.error}`,
        };
      }
      image = nextImage;
    }

    const palette = Array.isArray(card.palette) && card.palette.length === 3
      ? card.palette.map(String)
      : ["#f0e2cc", "#c9a468", "#8f6f42"];

    updatedCards.push({
      id: String(card.id),
      caption,
      image,
      palette: palette as [string, string, string],
      enabled: card.enabled !== false,
    });
  }

  try {
    await upsertSetting(supabase, "hero", { cards: updatedCards });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/hero");
  return { status: "success", message: "Hero kartları kaydedildi." };
}

// ============================== instagram ==============================

export async function saveInstagramSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const source = formData.get("source") === "manual" ? "manual" : "graph";
  const postLimit = Math.min(
    12,
    Math.max(3, Number(formData.get("post_limit") ?? 6)),
  );

  let posts: InstagramPost[] = [];
  if (source === "manual") {
    try {
      posts = JSON.parse(String(formData.get("posts_json") ?? "[]")) as InstagramPost[];
    } catch {
      return { status: "error", message: "Gönderi verisi okunamadı." };
    }
  }

  const updatedPosts: InstagramPost[] = [];

  if (source === "manual") {
    for (const post of posts) {
      const url = String(post.url ?? "").trim();
      if (!url) {
        return { status: "error", message: "Tüm gönderilerin Instagram linki dolu olmalı." };
      }

      let image = normalizeStoredImagePath(String(post.image ?? ""), "site");

      const file = formData.get(`image_${post.id}`) as File | null;
      if (file && file.size > 0) {
        const ext = extensionFromFilename(file.name);
        const nextImage = `instagram/${post.id}.${ext}`;
        const uploaded = await uploadImageFile(
          supabase,
          "site",
          nextImage,
          file,
          { upsert: true },
        );
        if (!uploaded.ok) {
          return {
            status: "error",
            message: `Görsel yüklenemedi: ${uploaded.error}`,
          };
        }
        image = nextImage;
      }

      if (!image) {
        return {
          status: "error",
          message: "Her gönderi için görsel yükleyin veya mevcut görseli koruyun.",
        };
      }

      updatedPosts.push({
        id: String(post.id),
        image,
        url,
        enabled: post.enabled !== false,
      });
    }
  }

  try {
    const patch: Record<string, unknown> = {
      enabled: formData.get("enabled") === "true",
      source,
      postLimit,
      eyebrow: String(formData.get("eyebrow") ?? "Instagram").trim(),
      title: String(formData.get("title") ?? "Son paylaşımlar").trim(),
    };
    // Graph mode must not wipe manually curated fallback posts.
    if (source === "manual") {
      patch.posts = updatedPosts;
    }
    await upsertSetting(supabase, "instagram", patch);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/instagram");
  revalidatePath("/", "layout");
  return { status: "success", message: "Instagram akışı kaydedildi." };
}

export async function testInstagramGraphConnection(): Promise<FormState> {
  await authedClient();
  const status = await getInstagramGraphStatus();

  if (!status.configured) {
    return {
      status: "error",
      message: status.error ?? "Token tanımlı değil.",
    };
  }

  if (!status.connected) {
    return {
      status: "error",
      message: status.error ?? "Instagram API bağlantısı kurulamadı.",
    };
  }

  try {
    const posts = await fetchInstagramGraphPosts(6);
    return {
      status: "success",
      message: `@${status.username} bağlı (${status.host ?? "graph"}) — ${posts.length} gönderi çekildi.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        `Profil açıldı ama medya alınamadı: ${
          error instanceof Error ? error.message : "bilinmeyen hata"
        }. Facebook Login token kullanıyorsanız INSTAGRAM_USER_ID (IG profesyonel hesap ID) gerekli olabilir.`,
    };
  }
}

// ============================= categories ==============================

export async function updateCategory(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const id = String(formData.get("id") ?? "");
  const payload = {
    title: String(formData.get("title") ?? ""),
    short: String(formData.get("short") ?? ""),
    description: String(formData.get("description") ?? ""),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (!id || !payload.title) {
    return { status: "error", message: "Başlık zorunludur." };
  }

  const { error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { status: "error", message: `Kaydedilemedi: ${error.message}` };
  }

  revalidateSite();
  revalidatePath("/admin/kategoriler");
  return { status: "success", message: "Kategori güncellendi." };
}

// ============================== giveaways ==============================

function collectUsernames(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => normalizeInstagramUsername(String(value ?? "")))
    .filter(Boolean);
}

export async function upsertGiveaway(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const drawDate = String(formData.get("draw_date") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug && title) slug = slugifyGiveawayTitle(title);

  if (!title || !drawDate || !slug) {
    return {
      status: "error",
      message: "Başlık, slug ve çekiliş tarihi zorunludur.",
    };
  }

  const payload = {
    title,
    slug,
    draw_date: drawDate,
    description: String(formData.get("description") ?? "").trim(),
    published: formData.get("published") === "on",
    updated_at: new Date().toISOString(),
  };

  const winners = collectUsernames(formData, "winners");
  const backups = collectUsernames(formData, "backups");

  let giveawayId = id;

  if (id) {
    const { error } = await supabase
      .from("giveaways")
      .update(payload)
      .eq("id", id);
    if (error) {
      return { status: "error", message: `Kaydedilemedi: ${error.message}` };
    }
  } else {
    const { data, error } = await supabase
      .from("giveaways")
      .insert(payload)
      .select("id")
      .single();
    if (error || !data) {
      return {
        status: "error",
        message: `Kaydedilemedi: ${error?.message ?? "bilinmeyen hata"}`,
      };
    }
    giveawayId = data.id;
  }

  await supabase.from("giveaway_entrants").delete().eq("giveaway_id", giveawayId);

  const entrantRows = [
    ...winners.map((username, index) => ({
      giveaway_id: giveawayId,
      role: "winner" as const,
      username,
      sort_order: index,
    })),
    ...backups.map((username, index) => ({
      giveaway_id: giveawayId,
      role: "backup" as const,
      username,
      sort_order: index,
    })),
  ];

  if (entrantRows.length > 0) {
    const { error: entrantError } = await supabase
      .from("giveaway_entrants")
      .insert(entrantRows);
    if (entrantError) {
      return {
        status: "error",
        message: `Katılımcılar kaydedilemedi: ${entrantError.message}`,
      };
    }
  }

  revalidateSite();
  revalidatePath("/admin/cekilis");
  revalidatePath("/sitemap.xml");

  if (!id) {
    redirect(`/admin/cekilis/${giveawayId}`);
  }

  return { status: "success", message: "Çekiliş kaydedildi." };
}

export async function deleteGiveaway(formData: FormData): Promise<void> {
  const supabase = await authedClient();
  await supabase
    .from("giveaways")
    .delete()
    .eq("id", String(formData.get("id") ?? ""));
  revalidateSite();
  revalidatePath("/admin/cekilis");
  revalidatePath("/sitemap.xml");
}

// ============================== adsense ================================

export async function saveAdSenseSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await authedClient();
  const slotIds = Object.keys(ADSENSE_SLOT_META) as AdSenseSlotId[];

  const publisherId = normalizePublisherId(
    String(formData.get("publisher_id") ?? ""),
  );
  const enabled = formData.get("enabled") === "true";

  if (enabled && !publisherId) {
    return {
      status: "error",
      message: "AdSense açıkken Publisher ID zorunludur (ca-pub-…).",
    };
  }

  const slots: Record<string, { enabled: boolean; slotId: string }> = {};
  for (const id of slotIds) {
    const slotEnabled = formData.get(`slot_${id}_enabled`) === "true";
    const slotId = String(formData.get(`slot_${id}_id`) ?? "").trim();
    if (slotEnabled && !slotId) {
      return {
        status: "error",
        message: `${ADSENSE_SLOT_META[id].label} etkin; Slot ID girin.`,
      };
    }
    slots[id] = { enabled: slotEnabled, slotId };
  }

  try {
    await upsertSetting(supabase, "adsense", {
      enabled,
      publisherId,
      testMode: formData.get("test_mode") === "true",
      slots,
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/reklamlar");
  revalidatePath("/ads.txt");
  revalidatePath("/gizlilik-politikasi");
  return { status: "success", message: "AdSense ayarları kaydedildi." };
}
