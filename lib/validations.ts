import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Lütfen adınızı girin."),
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  phone: z
    .string()
    .min(7, "Lütfen geçerli bir telefon numarası girin.")
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, "Mesajınız en az 10 karakter olmalı."),
});

export const bookingSchema = z.object({
  name: z.string().min(2, "Lütfen adınızı girin."),
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  phone: z.string().min(7, "Lütfen geçerli bir telefon numarası girin."),
  type: z.enum(["bebek", "dogum", "hamile", "dugun"], {
    message: "Lütfen bir çekim türü seçin.",
  }),
  date: z.string().min(1, "Lütfen tercih ettiğiniz tarihi seçin."),
  location: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialFormState: FormState = { status: "idle" };
