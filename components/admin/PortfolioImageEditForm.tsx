"use client";

import { useState, useTransition } from "react";
import { updatePortfolioImage } from "@/app/admin/actions";
import { uploadAdminImage } from "@/lib/admin-upload";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/Button";
import { CameraMemoriesLoader } from "@/components/ui/CameraMemoriesLoader";
import { InputField, SelectField } from "@/components/ui/Field";
import { extensionFromFilename } from "@/lib/storage-upload";
import { delay, UPLOAD_FINISH_DELAY_MS } from "@/lib/utils";
import { initialFormState, type FormState } from "@/lib/validations";

type Image = {
  id: string;
  caption: string;
  orientation: string;
  image_path: string | null;
  sort_order: number;
};

export function PortfolioImageEditForm({ image }: { image: Image }) {
  const [state, setState] = useState<FormState>(initialFormState);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        if (file) {
          const ext = extensionFromFilename(file.name);
          const path = `${image.id}/${Date.now()}.${ext}`;
          const uploaded = await uploadAdminImage(file, "portfolio", path);
          if (!uploaded.ok) {
            setState({
              status: "error",
              message: `Görsel yüklenemedi: ${uploaded.error}`,
            });
            return;
          }
          formData.set("new_image_path", uploaded.path);
        }

        formData.delete("file");
        const result = await updatePortfolioImage(initialFormState, formData);
        setState(result);
        if (result.status === "success") {
          await delay(UPLOAD_FINISH_DELAY_MS);
          setFile(null);
        }
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Güncelleme sırasında hata oluştu.",
        });
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-3 space-y-3 border-t border-espresso/10 pt-3"
    >
      {isPending ? (
        <CameraMemoriesLoader compact message="Anı güncelleniyor…" />
      ) : null}
      <FormMessage state={state} />
      <input type="hidden" name="id" value={image.id} />
      <input type="hidden" name="image_path" value={image.image_path ?? ""} />
      <InputField
        label="Başlık"
        name="caption"
        defaultValue={image.caption}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Yön"
          name="orientation"
          defaultValue={image.orientation}
        >
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
      <InputField
        label="Yeni Görsel"
        name="file"
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Güncelle"}
      </Button>
    </form>
  );
}
