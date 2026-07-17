"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/validations";
import {
  expandBlogMarkdown,
  generateImageFromPrompt,
  isGeminiConfigured,
} from "@/lib/gemini";
import {
  MAX_BLOG_IMAGES_PER_RUN,
  parseGeminiImageMarkers,
  replaceFirstMarker,
  slugifyBlogPathSegment,
} from "@/lib/blog-ai";
import { assertStoragePath } from "@/lib/storage-upload";

type BlogAiExpandResult = FormState & {
  content?: string;
  excerpt?: string;
};

type BlogAiImagesResult = FormState & {
  content?: string;
  generatedCount?: number;
  remainingMarkers?: number;
};

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/giris");
  return supabase;
}

export async function expandBlogContent(payload: {
  title: string;
  category: string;
  excerpt: string;
  content: string;
}): Promise<BlogAiExpandResult> {
  await authedClient();

  if (!isGeminiConfigured()) {
    return {
      status: "error",
      message:
        "GEMINI_API_KEY tanımlı değil. Vercel Environment Variables veya .env.local dosyasına ekleyin.",
    };
  }

  try {
    const result = await expandBlogMarkdown({
      title: String(payload.title ?? "").trim(),
      category: String(payload.category ?? "").trim() || "Genel",
      excerpt: String(payload.excerpt ?? ""),
      content: String(payload.content ?? ""),
    });
    return {
      status: "success",
      message: "İçerik Gemini ile genişletildi. Kaydetmeyi unutmayın.",
      content: result.content,
      excerpt: result.excerpt,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "İçerik genişletilemedi.";
    return { status: "error", message };
  }
}

export async function generateBlogInlineImages(payload: {
  content: string;
  slug: string;
}): Promise<BlogAiImagesResult> {
  const supabase = await authedClient();

  if (!isGeminiConfigured()) {
    return {
      status: "error",
      message:
        "GEMINI_API_KEY tanımlı değil. Vercel Environment Variables veya .env.local dosyasına ekleyin.",
    };
  }

  let content = String(payload.content ?? "");
  const slug = slugifyBlogPathSegment(payload.slug);
  const markers = parseGeminiImageMarkers(content).slice(
    0,
    MAX_BLOG_IMAGES_PER_RUN,
  );

  if (markers.length === 0) {
    return {
      status: "error",
      message:
        "Görsel yer tutucu bulunamadı. Önce «İçeriği genişlet» ile marker üretin veya Markdown’a <!-- gemini-image: ... | alt: ... --> ekleyin.",
      content,
      generatedCount: 0,
      remainingMarkers: 0,
    };
  }

  let generatedCount = 0;

  try {
    for (const marker of markers) {
      const image = await generateImageFromPrompt(marker.prompt);
      const ext = image.mimeType.includes("jpeg")
        ? "jpg"
        : image.mimeType.includes("webp")
          ? "webp"
          : "png";
      const path = `blog/${slug}/${Date.now()}-${generatedCount}.${ext}`;
      const safePath = assertStoragePath(path, "site", ["blog/"]);
      if (!safePath) {
        return {
          status: "error",
          message: "Geçersiz depolama yolu.",
          content,
          generatedCount,
          remainingMarkers: parseGeminiImageMarkers(content).length,
        };
      }

      const { error: uploadError } = await supabase.storage
        .from("site")
        .upload(safePath, image.bytes, {
          contentType: image.mimeType || "image/png",
          upsert: false,
        });

      if (uploadError) {
        return {
          status: "error",
          message: `Görsel yüklenemedi: ${uploadError.message}`,
          content,
          generatedCount,
          remainingMarkers: parseGeminiImageMarkers(content).length,
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("site").getPublicUrl(safePath);

      const alt = marker.alt.replace(/[[\]]/g, "");
      content = replaceFirstMarker(content, marker, `![${alt}](${publicUrl})`);
      generatedCount += 1;
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Görsel üretimi başarısız.";
    return {
      status: "error",
      message,
      content,
      generatedCount,
      remainingMarkers: parseGeminiImageMarkers(content).length,
    };
  }

  const remainingMarkers = parseGeminiImageMarkers(content).length;
  return {
    status: "success",
    message:
      remainingMarkers > 0
        ? `${generatedCount} görsel eklendi. Kalan yer tutucular için tekrar «Yazıya görsel ekle» kullanın.`
        : `${generatedCount} görsel eklendi. Kaydetmeyi unutmayın.`,
    content,
    generatedCount,
    remainingMarkers,
  };
}
