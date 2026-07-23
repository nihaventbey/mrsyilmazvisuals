"use server";

import { verifyAntiSpam } from "@/lib/anti-spam";
import { sendNotificationEmail } from "@/lib/email";
import { isMaintenanceActive } from "@/lib/maintenance";
import { getBookableCategories } from "@/lib/portfolio-categories";
import {
  createPublicClient,
  isSupabaseConfigured,
} from "@/lib/supabase/public";
import {
  bookingSchema,
  contactSchema,
  type FormState,
} from "@/lib/validations";

export async function submitContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (await isMaintenanceActive()) {
    return {
      status: "error",
      message:
        "Site şu anda bakım modunda. Lütfen daha sonra tekrar deneyin veya Instagram üzerinden bize ulaşın.",
    };
  }

  const spamError = await verifyAntiSpam(formData);
  if (spamError) {
    return { status: "error", message: spamError };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Lütfen formdaki hataları düzeltin.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, message } = parsed.data;

  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone: phone || "",
      message,
    });
    if (error) {
      return {
        status: "error",
        message:
          "Mesajınız kaydedilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
      };
    }
  }

  try {
    await sendNotificationEmail({
      subject: `Yeni iletişim mesajı — ${name}`,
      text: `Ad: ${name}\nE-posta: ${email}\nTelefon: ${phone || "-"}\n\nMesaj:\n${message}`,
    });
  } catch {
    // Message is already stored in the database; email is best-effort.
    if (!isSupabaseConfigured()) {
      return {
        status: "error",
        message:
          "Mesajınız gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
      };
    }
  }

  return {
    status: "success",
    message:
      "Mesajınız için teşekkürler! En kısa sürede size geri dönüş yapacağım.",
  };
}

export async function submitBooking(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (await isMaintenanceActive()) {
    return {
      status: "error",
      message:
        "Site şu anda bakım modunda. Lütfen daha sonra tekrar deneyin veya Instagram üzerinden bize ulaşın.",
    };
  }

  const spamError = await verifyAntiSpam(formData);
  if (spamError) {
    return { status: "error", message: spamError };
  }

  const parsed = bookingSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    type: formData.get("type"),
    date: formData.get("date"),
    location: formData.get("location"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Lütfen formdaki hataları düzeltin.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, type, date, location, notes } = parsed.data;

  const bookable = await getBookableCategories();
  const typeLabel =
    bookable.find((c) => c.slug === type)?.title ?? type;
  if (!bookable.some((c) => c.slug === type)) {
    return {
      status: "error",
      message: "Lütfen geçerli bir çekim türü seçin.",
      errors: { type: ["Lütfen geçerli bir çekim türü seçin."] },
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { error } = await supabase.from("bookings").insert({
      name,
      email,
      phone,
      shoot_type: type,
      preferred_date: date,
      location: location || "",
      notes: notes || "",
    });
    if (error) {
      return {
        status: "error",
        message:
          "Rezervasyon talebiniz kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
      };
    }
  }

  try {
    await sendNotificationEmail({
      subject: `Yeni rezervasyon talebi — ${typeLabel} (${name})`,
      text: `Ad: ${name}\nE-posta: ${email}\nTelefon: ${phone}\nÇekim türü: ${typeLabel}\nTercih edilen tarih: ${date}\nKonum: ${location || "-"}\n\nNotlar:\n${notes || "-"}`,
    });
  } catch {
    if (!isSupabaseConfigured()) {
      return {
        status: "error",
        message:
          "Rezervasyon talebiniz gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.",
      };
    }
  }

  return {
    status: "success",
    message:
      "Rezervasyon talebiniz alındı! Müsaitlik durumunu teyit etmek için sizinle iletişime geçeceğim.",
  };
}
