export type StorageBucket = "site" | "portfolio";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
  "avif",
  "svg",
]);

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/** Soft client/server limit for individual images. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export function extensionFromFilename(name: string, fallback = "jpg"): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (IMAGE_EXTENSIONS.has(ext)) {
    return ext === "jpeg" ? "jpg" : ext;
  }
  return fallback;
}

export function contentTypeForUpload(file: File, ext: string): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  return CONTENT_TYPES[ext] ?? "image/jpeg";
}

export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  if (!file.type || file.type === "application/octet-stream") {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    return IMAGE_EXTENSIONS.has(ext);
  }
  return false;
}

export function storagePathFromPublicUrl(
  url: string,
  bucket: StorageBucket,
): string | null {
  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
  ];
  for (const marker of markers) {
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      const raw = url.slice(idx + marker.length).split("?")[0];
      if (!raw) return null;
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

/** Keep relative storage paths; strip known public bucket URLs to paths. */
export function normalizeStoredImagePath(
  image: string,
  bucket: StorageBucket,
): string {
  const value = String(image ?? "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return storagePathFromPublicUrl(value, bucket) ?? "";
  }
  return value.replace(/^\//, "");
}

/** Reject path traversal and require an allowed prefix. */
export function assertStoragePath(
  path: string,
  bucket: StorageBucket,
  allowedPrefixes: string[],
): string | null {
  const normalized = normalizeStoredImagePath(path, bucket);
  if (!normalized || normalized.includes("..") || normalized.includes("\\")) {
    return null;
  }
  if (!allowedPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    return null;
  }
  return normalized;
}
