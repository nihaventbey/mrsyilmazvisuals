/**
 * Layered spam protection for public forms:
 *
 * 1. Honeypot — hidden "website" field; bots that fill every input get caught.
 * 2. Timing — hidden timestamp set by client JS on mount; direct POSTs without
 *    JS have no timestamp, and instant submissions (< MIN_FILL_MS) are bots.
 * 3. Cloudflare Turnstile (optional) — when TURNSTILE_SECRET_KEY is set, the
 *    widget token is verified server-side. Without keys, layers 1–2 still run.
 */

export const HONEYPOT_FIELD = "website";
export const TIMESTAMP_FIELD = "fts";

const MIN_FILL_MS = 3_000;
const MAX_FILL_MS = 24 * 60 * 60 * 1000;

const GENERIC_SPAM_MESSAGE =
  "Gönderiminiz doğrulanamadı. Lütfen sayfayı yenileyip tekrar deneyin.";

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Cloudflare unreachable: fail open so real visitors are not blocked;
    // honeypot and timing checks have already passed at this point.
    return true;
  }
}

/**
 * Returns null when the submission looks human, otherwise a user-facing
 * Turkish error message.
 */
export async function verifyAntiSpam(
  formData: FormData,
): Promise<string | null> {
  const honeypot = String(formData.get(HONEYPOT_FIELD) ?? "").trim();
  if (honeypot) return GENERIC_SPAM_MESSAGE;

  const timestamp = Number(formData.get(TIMESTAMP_FIELD));
  if (!Number.isFinite(timestamp)) return GENERIC_SPAM_MESSAGE;
  const elapsed = Date.now() - timestamp;
  if (elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return GENERIC_SPAM_MESSAGE;
  }

  if (isTurnstileEnabled()) {
    const token = String(formData.get("cf-turnstile-response") ?? "");
    const ok = await verifyTurnstileToken(token);
    if (!ok) {
      return "Robot doğrulaması başarısız oldu. Lütfen doğrulamayı tamamlayıp tekrar deneyin.";
    }
  }

  return null;
}
