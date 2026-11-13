import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin-auth";
import { fetchInstagramCommentsFromUrl } from "@/lib/instagram-comments";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";

async function isCallerAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return isAdminUser(user);
  } catch {
    return false;
  }
}

function enforceRateLimit(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const rl = checkRateLimit(`ig-comments:${ip}`, 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Çok fazla istek gönderildi. Lütfen biraz bekleyin.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      },
    );
  }
  return null;
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url") || searchParams.get("link") || "";

  if (!url) {
    return NextResponse.json(
      { success: false, message: "Instagram gönderi linki (url) gerekli." },
      { status: 400 },
    );
  }

  const allowGraphApi = await isCallerAdmin();
  const result = await fetchInstagramCommentsFromUrl(url, { allowGraphApi });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const url = body.url || body.link || body.shortcode || "";

    if (!url) {
      return NextResponse.json(
        { success: false, message: "Instagram gönderi linki gerekli." },
        { status: 400 },
      );
    }

    const allowGraphApi = await isCallerAdmin();
    const result = await fetchInstagramCommentsFromUrl(url, { allowGraphApi });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }
}
