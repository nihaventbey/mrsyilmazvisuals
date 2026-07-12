"use client";

import { ActionForm } from "@/components/admin/ActionForm";
import { updatePortfolioImage } from "@/app/admin/actions";
import { InputField, SelectField } from "@/components/ui/Field";

type Image = {
  id: string;
  caption: string;
  orientation: string;
  image_path: string | null;
  sort_order: number;
};

export function PortfolioImageEditForm({ image }: { image: Image }) {
  return (
    <ActionForm
      action={updatePortfolioImage}
      submitLabel="Güncelle"
      className="mt-3 space-y-3 border-t border-espresso/10 pt-3"
    >
      <input type="hidden" name="id" value={image.id} />
      <input type="hidden" name="image_path" value={image.image_path ?? ""} />
      <InputField
        label="Başlık"
        name="caption"
        defaultValue={image.caption}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <SelectField label="Yön" name="orientation" defaultValue={image.orientation}>
          <option value="portrait">Dikey</option>
          <option value="landscape">Yatay</option>
        </SelectField>
        <InputField
          label="Sıra"
          name="sort_order"
          type="number"
          defaultValue={String(image.sort_order)}
        />
      </div>
      <InputField label="Yeni Görsel" name="file" type="file" accept="image/*" />
    </ActionForm>
  );
}
