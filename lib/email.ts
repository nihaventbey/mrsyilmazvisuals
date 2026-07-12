type EmailPayload = {
  subject: string;
  text: string;
};

/**
 * Sends a notification email. When RESEND_API_KEY is configured, the message
 * is delivered through the Resend REST API. Otherwise it falls back to logging
 * the payload to the server console so forms remain functional in development.
 */
export async function sendNotificationEmail({
  subject,
  text,
}: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  const from = process.env.CONTACT_FROM ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.info("[email] E-posta servisi yapılandırılmamış. İçerik:", {
      subject,
      text,
    });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`E-posta gönderilemedi: ${detail}`);
  }
}
