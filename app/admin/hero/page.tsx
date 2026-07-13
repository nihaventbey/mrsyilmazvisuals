import { HeroCardsManager } from "@/components/admin/HeroCardsManager";
import { getHeroSettings } from "@/lib/hero";
import { storagePublicUrl } from "@/lib/supabase/public";
import type { HeroCard } from "@/lib/hero";

function withPreview(card: HeroCard) {
  const previewUrl =
    card.image && !card.image.startsWith("/") && !card.image.startsWith("http")
      ? storagePublicUrl("site", card.image) ?? undefined
      : card.image || undefined;

  return { ...card, previewUrl };
}

export default async function AdminHeroPage() {
  const settings = await getHeroSettings();

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Hero Polaroid Kartları</h1>
      <p className="mt-2 text-sm text-mocha">
        Ana sayfa girişindeki dağılan polaroid görsellerini buradan düzenleyin.
      </p>
      <div className="mt-8">
        <HeroCardsManager
          initialCards={settings.cards.map(withPreview)}
        />
      </div>
    </div>
  );
}
