"use client";

import { useState } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { upsertGiveaway } from "@/app/admin/actions";
import { InputField, TextareaField } from "@/components/ui/Field";

type GiveawayFormProps = {
  giveaway?: {
    id: string;
    title: string;
    slug: string;
    drawDate: string;
    description: string;
    published: boolean;
    winners: string[];
    backups: string[];
  };
};

function UsernameList({
  label,
  name,
  values,
  onChange,
}: {
  label: string;
  name: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-espresso">{label}</p>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="cursor-pointer text-xs text-gold-dark hover:underline"
        >
          + Ekle
        </button>
      </div>
      <div className="space-y-2">
        {values.length === 0 && (
          <p className="text-xs text-mist">Henüz kullanıcı adı yok.</p>
        )}
        {values.map((value, index) => (
          <div key={`${name}-${index}`} className="flex gap-2">
            <input
              type="text"
              name={name}
              value={value}
              onChange={(e) => {
                const next = [...values];
                next[index] = e.target.value;
                onChange(next);
              }}
              placeholder="@kullaniciadi"
              className="w-full rounded-xl border border-espresso/20 bg-white/60 px-4 py-2.5 text-sm text-espresso placeholder:text-mist transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="cursor-pointer shrink-0 px-2 text-sm text-red-700 hover:text-red-900"
              aria-label="Kaldır"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GiveawayForm({ giveaway }: GiveawayFormProps) {
  const [winners, setWinners] = useState<string[]>(
    giveaway?.winners?.length ? giveaway.winners : [""],
  );
  const [backups, setBackups] = useState<string[]>(
    giveaway?.backups?.length ? giveaway.backups : [""],
  );

  return (
    <ActionForm
      action={upsertGiveaway}
      submitLabel={giveaway?.id ? "Çekilişi Güncelle" : "Çekiliş Oluştur"}
    >
      {giveaway?.id && <input type="hidden" name="id" value={giveaway.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Başlık"
          name="title"
          required
          defaultValue={giveaway?.title}
        />
        <InputField
          label="Slug"
          name="slug"
          placeholder="bos birakilirsa basliktan uretilir"
          defaultValue={giveaway?.slug}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Çekiliş tarihi"
          name="draw_date"
          type="date"
          required
          defaultValue={giveaway?.drawDate}
        />
        <label className="flex items-end gap-2 pb-3 text-sm text-mocha">
          <input
            type="checkbox"
            name="published"
            defaultChecked={giveaway?.published}
          />
          Yayınla
        </label>
      </div>
      <TextareaField
        label="Açıklama (opsiyonel)"
        name="description"
        defaultValue={giveaway?.description}
        className="min-h-24"
      />
      <UsernameList
        label="Kazananlar"
        name="winners"
        values={winners}
        onChange={setWinners}
      />
      <UsernameList
        label="Yedekler"
        name="backups"
        values={backups}
        onChange={setBackups}
      />
    </ActionForm>
  );
}
