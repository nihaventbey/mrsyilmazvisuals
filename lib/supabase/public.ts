import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free anonymous client for public content reads.
 * Keeps public pages statically renderable (no per-request cookies).
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function storagePublicUrl(
  bucket: string,
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/** @deprecated Use storagePublicUrl("portfolio", path) */
export function portfolioPublicUrl(path: string | null | undefined): string | null {
  return storagePublicUrl("portfolio", path);
}
