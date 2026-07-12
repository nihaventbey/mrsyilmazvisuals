"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitBooking } from "@/app/actions";
import { initialFormState } from "@/lib/validations";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";
import type { Service } from "@/lib/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Gönderiliyor..." : "Rezervasyon Talebi Gönder"}
    </Button>
  );
}

export function BookingForm({
  defaultType,
  services,
}: {
  defaultType?: string;
  services: Service[];
}) {
  const [state, formAction] = useActionState(submitBooking, initialFormState);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />
      <InputField
        label="Ad Soyad"
        name="name"
        required
        placeholder="Adınız ve soyadınız"
        errors={state.errors?.name}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField
          label="E-posta"
          name="email"
          type="email"
          required
          placeholder="ornek@email.com"
          errors={state.errors?.email}
        />
        <InputField
          label="Telefon"
          name="phone"
          type="tel"
          required
          placeholder="05xx xxx xx xx"
          errors={state.errors?.phone}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Çekim Türü"
          name="type"
          required
          defaultValue={defaultType ?? ""}
          errors={state.errors?.type}
        >
          <option value="" disabled>
            Seçiniz
          </option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.title}
            </option>
          ))}
        </SelectField>
        <InputField
          label="Tercih Edilen Tarih"
          name="date"
          type="date"
          required
          errors={state.errors?.date}
        />
      </div>
      <InputField
        label="Konum / Şehir"
        name="location"
        placeholder="Örn. İstanbul, stüdyo veya dış mekân"
        errors={state.errors?.location}
      />
      <TextareaField
        label="Ek Notlar"
        name="notes"
        placeholder="Konsept fikirleriniz, özel istekleriniz veya sorularınız"
        errors={state.errors?.notes}
      />
      <SubmitButton />
    </form>
  );
}
