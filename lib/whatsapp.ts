/** Normalize a phone into wa.me digits (country code, no + or spaces). */
export function toWhatsAppDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Local TR mobiles starting with 05… → 905…
  if (digits.startsWith("0") && digits.length === 11) {
    return `90${digits.slice(1)}`;
  }
  return digits;
}

export function toWhatsAppUrl(
  phone: string,
  message = "Merhaba, çekim hakkında bilgi almak istiyorum.",
): string | null {
  const digits = toWhatsAppDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatWhatsAppDisplay(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("+") ? trimmed : `+${toWhatsAppDigits(trimmed) ?? trimmed}`;
}
