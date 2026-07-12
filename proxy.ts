import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { fetchMaintenanceEnabled } from "@/lib/maintenance";

function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/giris";
  const isMaintenancePage = pathname === "/bakim";
  const isAdminRoute = pathname.startsWith("/admin");
  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  let user: { id: string } | null = null;

  if (supabaseConfigured) {
    const supabase = createSupabaseClient(request, response);
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const maintenanceOn = await fetchMaintenanceEnabled();

  if (maintenanceOn && !isAdminRoute && !isMaintenancePage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/bakim";
    return NextResponse.redirect(url);
  }

  if (!maintenanceOn && isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Supabase not configured yet: only the login page is reachable.
  if (!supabaseConfigured) {
    if (isAdminRoute && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/giris";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Refresh the session and gate the admin area.
  if (isAdminRoute && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/giris";
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
