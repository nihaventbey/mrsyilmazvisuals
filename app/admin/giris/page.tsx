"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";
import { initialFormState } from "@/lib/validations";
import { InputField } from "@/components/ui/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    signIn,
    initialFormState,
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-espresso/10 bg-white/50 p-8">
        <h1 className="text-center font-serif text-2xl text-espresso">
          Yönetim Paneli
        </h1>
        <p className="mt-2 text-center text-sm text-mocha">
          Devam etmek için giriş yapın
        </p>
        <form action={formAction} className="mt-8 space-y-5">
          <FormMessage state={state} />
          <InputField
            label="E-posta"
            name="email"
            type="email"
            required
            placeholder="admin@example.com"
          />
          <InputField
            label="Şifre"
            name="password"
            type="password"
            required
            placeholder="••••••••"
          />
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      </div>
    </div>
  );
}
