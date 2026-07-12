"use client";

import { ActionForm } from "@/components/admin/ActionForm";
import { upsertFaq } from "@/app/admin/actions";
import { InputField, TextareaField } from "@/components/ui/Field";

type Faq = {
  id?: string;
  question?: string;
  answer?: string;
  sort_order?: number;
};

export function FaqForm({ faq }: { faq?: Faq }) {
  return (
    <ActionForm
      action={upsertFaq}
      submitLabel={faq?.id ? "Soruyu Güncelle" : "Soru Ekle"}
    >
      {faq?.id && <input type="hidden" name="id" value={faq.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <InputField
          label="Soru"
          name="question"
          required
          defaultValue={faq?.question}
        />
        <InputField
          label="Sıra"
          name="sort_order"
          type="number"
          defaultValue={faq?.sort_order ?? 0}
          className="w-24"
        />
      </div>
      <TextareaField
        label="Cevap"
        name="answer"
        required
        defaultValue={faq?.answer}
        className="min-h-24"
      />
    </ActionForm>
  );
}
