"use client";

import { ActionForm } from "@/components/admin/ActionForm";
import { updateCategory } from "@/app/admin/actions";
import { InputField, TextareaField } from "@/components/ui/Field";

type Category = {
  id: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  sort_order: number;
};

export function CategoryForm({ category }: { category: Category }) {
  return (
    <ActionForm action={updateCategory} submitLabel="Kategoriyi Kaydet">
      <input type="hidden" name="id" value={category.id} />
      <p className="text-xs uppercase tracking-wider text-mist">
        Slug: {category.slug}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Başlık" name="title" defaultValue={category.title} required />
        <InputField label="Kısa Etiket" name="short" defaultValue={category.short} />
      </div>
      <TextareaField
        label="Açıklama"
        name="description"
        defaultValue={category.description}
        className="min-h-24"
      />
      <InputField
        label="Sıra"
        name="sort_order"
        type="number"
        defaultValue={String(category.sort_order)}
      />
    </ActionForm>
  );
}
