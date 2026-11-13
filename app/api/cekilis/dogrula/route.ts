import { NextResponse } from "next/server";
import { verifyGiveawayCode } from "@/lib/giveaways";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";

function enforceRateLimit(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const rl = checkRateLimit(`giveaway-verify:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        verified: false,
        message: "Çok fazla doğrulama denemesi. Lütfen biraz bekleyin.",
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
  const code = searchParams.get("code") || searchParams.get("q") || "";

  if (!code) {
    return NextResponse.json(
      {
        verified: false,
        message: "Kod veya kullanıcı adı parametresi (code) gerekli.",
      },
      { status: 400 },
    );
  }

  const result = await verifyGiveawayCode(code);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const code = body.code || body.query || "";

    if (!code) {
      return NextResponse.json(
        {
          verified: false,
          message: "Kod veya kullanıcı adı gerekli.",
        },
        { status: 400 },
      );
    }

    const result = await verifyGiveawayCode(code);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { verified: false, message: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }
}
