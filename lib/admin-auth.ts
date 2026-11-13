type AuthUserLike = {
  id?: string;
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
} | null;

/**
 * Verifies whether an authenticated Supabase user is authorized for admin access.
 * - If ADMIN_EMAILS is configured (comma-separated), enforces email allowlist.
 * - Else if app_metadata.role is present on the user, requires role === "admin".
 * - Otherwise permits any authenticated user (single-admin project with public signups disabled).
 */
export function isAdminUser(user: AuthUserLike): boolean {
  if (!user?.id) return false;

  const allowlistRaw = process.env.ADMIN_EMAILS?.trim();
  if (allowlistRaw) {
    const allowed = new Set(
      allowlistRaw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    );
    const email = user.email?.trim().toLowerCase() ?? "";
    return Boolean(email && allowed.has(email));
  }

  const role = user.app_metadata?.role;
  if (typeof role === "string" && role.length > 0) {
    return role === "admin";
  }

  return true;
}
