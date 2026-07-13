"use client";

import { useCallback, useState, useTransition } from "react";
import Image from "next/image";
import { saveHeroSettings } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { initialFormState, type FormState } from "@/lib/validations";
import type { HeroCard } from "@/lib/hero";
import { buildDefaultHeroCards } from "@/lib/hero-defaults";

type EditableCard = HeroCard & {
  previewUrl?: string;
};

function newCard(caption = ""): EditableCard {
  const index = Math.floor(Math.random() * 1000);
  return {
    id: crypto.randomUUID(),
    caption,
    image: "",
    palette: buildDefaultHeroCards()[index % buildDefaultHeroCards().length].palette,
    enabled: true,
  };
}

export function HeroCardsManager({
  initialCards,
}: {
  initialCards: HeroCard[];
}) {
  const [cards, setCards] = useState<EditableCard[]>(initialCards);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [state, setState] = useState<FormState>(initialFormState);
  const [isPending, startTransition] = useTransition();

  const updateCard = useCallback(
    (id: string, patch: Partial<EditableCard>) => {
      setCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, ...patch } : card)),
      );
    },
    [],
  );

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    setFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const onFileChange = useCallback((id: string, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFiles((prev) => ({ ...prev, [id]: file }));
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, previewUrl } : card,
      ),
    );
  }, []);

  const onSubmit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set(
        "cards_json",
        JSON.stringify(
          cards.map(({ id, caption, image, palette, enabled }) => ({
            id,
            caption,
            image,
            palette,
            enabled,
          })),
        ),
      );
      for (const [id, file] of Object.entries(files)) {
        formData.set(`image_${id}`, file);
      }
      const result = await saveHeroSettings(initialFormState, formData);
      setState(result);
      if (result.status === "success") {
        setFiles({});
      }
    });
  };

  return (
    <div className="space-y-6">
      <FormMessage state={state} />

      <div className="rounded-2xl border border-espresso/10 bg-white/50 p-4 text-sm text-mocha">
        Ana sayfa hero alanındaki polaroid kartları buradan yönetilir.
        Görsel yüklemezseniz renkli placeholder kullanılır. En az 4, en fazla
        20 kart önerilir.
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="rounded-2xl border border-espresso/10 bg-white/50 p-5"
          >
            <div className="flex flex-wrap items-start gap-5">
              <div className="relative h-28 w-24 overflow-hidden rounded-lg bg-champagne shadow-sm">
                {card.previewUrl ? (
                  <Image
                    src={card.previewUrl}
                    alt={card.caption}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized={card.previewUrl.startsWith("blob:")}
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${card.palette[0]} 0%, ${card.palette[1]} 55%, ${card.palette[2]} 100%)`,
                    }}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-gold-dark">
                    Kart {index + 1}
                  </p>
                  <label className="flex items-center gap-2 text-xs text-mocha">
                    <input
                      type="checkbox"
                      checked={card.enabled}
                      onChange={(e) =>
                        updateCard(card.id, { enabled: e.target.checked })
                      }
                    />
                    Aktif
                  </label>
                </div>

                <InputField
                  label="Başlık"
                  name={`caption_${card.id}`}
                  value={card.caption}
                  onChange={(e) =>
                    updateCard(card.id, { caption: e.target.value })
                  }
                  required
                />

                <InputField
                  label="Görsel"
                  name={`file_${card.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onFileChange(card.id, e.target.files?.[0] ?? null)
                  }
                />

                <div className="grid grid-cols-3 gap-2">
                  {(["Açık", "Orta", "Koyu"] as const).map((label, i) => (
                    <InputField
                      key={label}
                      label={`${label} renk`}
                      name={`palette_${card.id}_${i}`}
                      value={card.palette[i]}
                      onChange={(e) => {
                        const palette = [...card.palette] as [
                          string,
                          string,
                          string,
                        ];
                        palette[i] = e.target.value;
                        updateCard(card.id, { palette });
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeCard(card.id)}
                className="text-sm text-red-700 transition-colors hover:text-red-900"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCards((prev) => [...prev, newCard("Yeni anı")])}
        >
          Kart Ekle
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isPending}>
          {isPending ? "Kaydediliyor..." : "Hero Kartlarını Kaydet"}
        </Button>
      </div>
    </div>
  );
}
