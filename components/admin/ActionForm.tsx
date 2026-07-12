"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import type { FormState } from "@/lib/validations";
import { initialFormState } from "@/lib/validations";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  children: ReactNode;
  className?: string;
};

/** Generic admin form wrapper around useActionState for upsert server actions. */
export function ActionForm({ action, submitLabel, children, className }: Props) {
  const [state, formAction, pending] = useActionState(
    action,
    initialFormState,
  );

  return (
    <form action={formAction} className={className ?? "space-y-4"}>
      <FormMessage state={state} />
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor..." : submitLabel}
      </Button>
    </form>
  );
}
