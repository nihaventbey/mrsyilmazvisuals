"use client";

import { createClient } from "@/lib/supabase/client";
import {
  contentTypeForUpload,
  extensionFromFilename,
  MAX_IMAGE_BYTES,
  type StorageBucket,
} from "@/lib/storage-upload";

export type AdminUploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

/**
 * Upload images directly from the browser to Supabase Storage.
 * Avoids Vercel's ~4.5MB Server Action / function payload limit.
 */
export async function uploadAdminImage(
  file: File,
  bucket: StorageBucket,
  path: string,
  options?: { upsert?: boolean },
): Promise<AdminUploadResult> {
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: false, error: "Geçersiz dosya." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: `Dosya 15 MB'dan büyük olamaz (${file.name}).`,
    };
  }

  const ext = extensionFromFilename(file.name);
  const contentType = contentTypeForUpload(file, ext);
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: options?.upsert ?? false,
    cacheControl: "3600",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, path };
}

export function storagePathForUpload(
  folder: string,
  id: string,
  file: File,
  fallbackExt = "jpg",
): string {
  const ext = extensionFromFilename(file.name, fallbackExt);
  return `${folder.replace(/\/$/, "")}/${id}.${ext}`;
}
