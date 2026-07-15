"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { saveHeroSettings } from "@/app/admin/actions";
import { uploadAdminImage, storagePathForUpload } from "@/lib/admin-upload";
import { Button } from "@/components/ui/Button";
import { CameraMemoriesLoader } from "@/components/ui/CameraMemoriesLoader";
import { InputField } from "@/components/ui/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { storagePublicUrl } from "@/lib/supabase/public";
import { initialFormState, type FormState } from "@/lib/validations";
import type { HeroCard } from "@/lib/hero";
import { buildDefaultHeroCards } from "@/lib/hero-defaults";
import { delay, UPLOAD_FINISH_DELAY_MS } from "@/lib/utils";

const SAVE_MESSAGES = [
  "Anılar kaydediliyor…",
  "Poz veriliyor…",
  "Polaroidler yerleşiyor…",
  "Işık ayarlanıyor…",
  "Kareler birleştiriliyor…",
];

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
  const [loaderMessage, setLoaderMessage] = useState(SAVE_MESSAGES[0]);

  useEffect(() => {
    if (!isPending) {
      setLoaderMessage(SAVE_MESSAGES[0]);
      return;
    }
    const id = window.setInterval(() => {
      setLoaderMessage((prev) => {
        const idx = SAVE_MESSAGES.indexOf(prev);
        return SAVE_MESSAGES[(idx + 1) % SAVE_MESSAGES.length];
      });
    }, 2200);
    return () => window.clearInterval(id);
  }, [isPending]);

  const updateCard = useCallback(
    (id: string, patch: Partial<EditableCard>) => {
      setCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, ...patch } : card)),
      );
    },
    [],
  );

  const removeCard = useCallback((id: string) => {
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (card?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(card.previewUrl);
      }
      return prev.filter((c) => c.id !== id);
    });
    setFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const onFileChange = useCallback((id: string, file: File | null) => {
    if (!file) return;
    setCards((prev) => {
      const previous = prev.find((c) => c.id === id)?.previewUrl;
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      const previewUrl = URL.createObjectURL(file);
      return prev.map((card) =>
        card.id === id ? { ...card, previewUrl } : card,
      );
    });
    setFiles((prev) => ({ ...prev, [id]: file }));
  }, []);

  const onSubmit = () => {
    startTransition(async () => {
      try {
        const nextCards: EditableCard[] = [];
        const uploads = Object.keys(files).length;
        let done = 0;

        for (const card of cards) {
          const file = files[card.id];
          let image = card.image;

          if (file) {
            done += 1;
            setLoaderMessage(
              uploads > 1
                ? `Anı ${done}/${uploads} kaydediliyor…`
                : "Anı kaydediliyor…",
            );
            const path = storagePathForUpload("hero", card.id, file);
            const uploaded = await uploadAdminImage(file, "site", path, {
              upsert: true,
            });
            if (!uploaded.ok) {
              setState({
                status: "error",
                message: `Görsel yüklenemedi (${card.caption}): ${uploaded.error}`,
              });
              return;
            }
            image = uploaded.path;
          }

          nextCards.push({
            id: card.id,
            caption: card.caption,
            image,
            palette: card.palette,
            enabled: card.enabled,
            previewUrl: card.previewUrl,
          });
        }

        setLoaderMessage("Polaroidler yerine oturuyor…");

        const formData = new FormData();
        formData.set(
          "cards_json",
          JSON.stringify(
            nextCards.map(({ id, caption, image, palette, enabled }) => ({
              id,
              caption,
              image,
              palette,
              enabled,
            })),
          ),
        );

        const result = await saveHeroSettings(initialFormState, formData);
        setState(result);

        if (result.status === "success") {
          setLoaderMessage("Anılar hazır!");
          await delay(UPLOAD_FINISH_DELAY_MS);
          setFiles({});
          setCards((prev) =>
            prev.map((card) => {
              if (card.previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(card.previewUrl);
              }
              const saved = nextCards.find((c) => c.id === card.id);
              if (!saved) return card;
              return {
                ...card,
                image: saved.image,
                previewUrl: storagePublicUrl("site", saved.image) ?? undefined,
              };
            }),
          );
        }
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Kaydetme sırasında beklenmeyen bir hata oluştu.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {isPending ? (
        <CameraMemoriesLoader overlay message={loaderMessage} />
      ) : null}

      <FormMessage state={state} />

      <div className="rounded-2xl border border-espresso/10 bg-white/50 p-4 text-sm text-mocha">
        Ana sayfa hero alanındaki polaroid kartları buradan yönetilir.
        Görseller doğrudan depolamaya yüklenir (büyük dosyalar desteklenir).
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
                disabled={isPending}
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
          disabled={isPending}
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
