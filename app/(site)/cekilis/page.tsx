import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPublishedGiveaways } from "@/lib/giveaways";
import { GiveawayTabs } from "@/components/giveaway/GiveawayTabs";

export const metadata: Metadata = {
  title: "Instagram Çekiliş Aracı & Kod Doğrulama",
  description:
    "Mrs. Yılmaz Visuals hızlı Instagram çekiliş yapma aracı ve çekiliş bilet/doğrulama kodu sorgulama ekranı.",
  alternates: { canonical: "/cekilis" },
};

export const revalidate = 60;

export default async function GiveawaysPage() {
  const giveaways = await getPublishedGiveaways();

  return (
    <>
      <PageHeader
        eyebrow="Instagram Çekiliş Aracı"
        title="Çekiliş & Kod Doğrulama"
        description="Çekiliş doğrulama kodunuzu sorgulayarak sonuçların orijinalliğini teyit edin veya canlı hızlı çekiliş yapın."
      />

      <section className="container-page py-12 sm:py-16 lg:py-20">
        <GiveawayTabs giveaways={giveaways} />
      </section>
    </>
  );
}
