"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact } from "@/app/actions";
import { initialFormState } from "@/lib/validations";
import { InputField, TextareaField } from "@/components/ui/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Gönderiliyor..." : "Mesajı Gönder"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialFormState);

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
          placeholder="05xx xxx xx xx"
          errors={state.errors?.phone}
        />
      </div>
      <TextareaField
        label="Mesajınız"
        name="message"
        required
        placeholder="Nasıl yardımcı olabilirim?"
        errors={state.errors?.message}
      />
      <SubmitButton />
    </form>
  );
}
