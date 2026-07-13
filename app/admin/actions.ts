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
    "/bakim",
    "/gizlilik-politikasi",
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
    const ext = file.name.split(".").pop() || "jpg";
    imagePath = `${categoryId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(imagePath, file, { contentType: file.type });
    if (uploadError) {
      return {
        status: "error",
        message: `Görsel yüklenemedi: ${uploadError.message}`,
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
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `${categoryId}/${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(imagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
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
    const ext = file.name.split(".").pop() || "jpg";
    imagePath = `${id}/${Date.now()}.${ext}`;
    if (currentPath) {
      await supabase.storage.from("portfolio").remove([currentPath]);
    }
    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(imagePath, file, { contentType: file.type });
    if (uploadError) {
      return {
        status: "error",
        message: `Görsel yüklenemedi: ${uploadError.message}`,
      };
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
    const ext = logoFile.name.split(".").pop() || "png";
    const logoImage = `logo/wordmark-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("site")
      .upload(logoImage, logoFile, { contentType: logoFile.type, upsert: true });
    if (uploadError) {
      return {
        status: "error",
        message: `Üst menü logosu yüklenemedi: ${uploadError.message}`,
      };
    }
    patch.logoImage = logoImage;
  }

  if (logoIconFile && logoIconFile.size > 0) {
    const ext = logoIconFile.name.split(".").pop() || "png";
    const logoIcon = `logo/icon-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("site")
      .upload(logoIcon, logoIconFile, { contentType: logoIconFile.type, upsert: true });
    if (uploadError) {
      return {
        status: "error",
        message: `İkon logosu yüklenemedi: ${uploadError.message}`,
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

  const ext = aboutFile.name.split(".").pop() || "jpg";
  const aboutImage = `about/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("site")
    .upload(aboutImage, aboutFile, { contentType: aboutFile.type, upsert: true });
  if (uploadError) {
    return {
      status: "error",
      message: `Hakkımda görseli yüklenemedi: ${uploadError.message}`,
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

    let image = String(card.image ?? "");
    if (image.startsWith("http")) {
      const marker = "/storage/v1/object/public/site/";
      const idx = image.indexOf(marker);
      image = idx >= 0 ? image.slice(idx + marker.length) : "";
    }

    const file = formData.get(`image_${card.id}`) as File | null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "jpg";
      image = `hero/${card.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("site")
        .upload(image, file, { contentType: file.type, upsert: true });
      if (uploadError) {
        return {
          status: "error",
          message: `Görsel yüklenemedi (${caption}): ${uploadError.message}`,
        };
      }
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

      let image = String(post.image ?? "");
      if (image.startsWith("http")) {
        const marker = "/storage/v1/object/public/site/";
        const idx = image.indexOf(marker);
        image = idx >= 0 ? image.slice(idx + marker.length) : "";
      }

      const file = formData.get(`image_${post.id}`) as File | null;
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        image = `instagram/${post.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("site")
          .upload(image, file, { contentType: file.type, upsert: true });
        if (uploadError) {
          return {
            status: "error",
            message: `Görsel yüklenemedi: ${uploadError.message}`,
          };
        }
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
    await upsertSetting(supabase, "instagram", {
      enabled: formData.get("enabled") === "true",
      source,
      postLimit,
      eyebrow: String(formData.get("eyebrow") ?? "Instagram").trim(),
      title: String(formData.get("title") ?? "Son paylaşımlar").trim(),
      posts: updatedPosts,
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kaydedilemedi.",
    };
  }

  revalidateSite();
  revalidatePath("/admin/instagram");
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
      message: `@${status.username} bağlı — ${posts.length} gönderi çekildi.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Gönderiler alınamadı.",
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
