"use client";

import { ActionForm } from "@/components/admin/ActionForm";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/admin/actions";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useActionState } from "react";
import { FormMessage } from "@/components/forms/FormMessage";
import { initialFormState } from "@/lib/validations";

type Category = {
  id: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  sort_order: number;
  parent_id: string | null;
};

type ParentOption = { id: string; title: string };

export function CreateCategoryForm({
  parents,
}: {
  parents: ParentOption[];
}) {
  return (
    <ActionForm action={createCategory} submitLabel="Kategori Oluştur">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Başlık" name="title" required />
        <InputField
          label="Slug"
          name="slug"
          placeholder="ornek-kategori"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Kısa Etiket" name="short" />
        <InputField
          label="Sıra"
          name="sort_order"
          type="number"
          defaultValue="0"
        />
      </div>
      <SelectField label="Üst kategori" name="parent_id" defaultValue="">
        <option value="">— Yok (üst seviye) —</option>
        {parents.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </SelectField>
      <TextareaField label="Açıklama" name="description" className="min-h-24" />
    </ActionForm>
  );
}

export function CategoryForm({
  category,
  parents,
}: {
  category: Category;
  parents: ParentOption[];
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    async (_prev: typeof initialFormState, formData: FormData) =>
      deleteCategory(formData),
    initialFormState,
  );

  return (
    <div className="space-y-4">
      <ActionForm action={updateCategory} submitLabel="Kategoriyi Kaydet">
        <input type="hidden" name="id" value={category.id} />
        <p className="text-xs uppercase tracking-wider text-mist">
          Slug: {category.slug}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Başlık"
            name="title"
            defaultValue={category.title}
            required
          />
          <InputField
            label="Kısa Etiket"
            name="short"
            defaultValue={category.short}
          />
        </div>
        <SelectField
          label="Üst kategori"
          name="parent_id"
          defaultValue={category.parent_id ?? ""}
        >
          <option value="">— Yok (üst seviye) —</option>
          {parents
            .filter((p) => p.id !== category.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
        </SelectField>
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

      <form action={deleteAction} className="border-t border-espresso/10 pt-4">
        <FormMessage state={deleteState} />
        <input type="hidden" name="id" value={category.id} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={deletePending}
          className="border-red-300 text-red-800 hover:bg-red-50"
          onClick={(e) => {
            if (
              !window.confirm(
                `"${category.title}" kategorisini silmek istediğinize emin misiniz? Alt kategoriler ve görseller de silinir.`,
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          {deletePending ? "Siliniyor..." : "Kategoriyi Sil"}
        </Button>
      </form>
    </div>
  );
}
