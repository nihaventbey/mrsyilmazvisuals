import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { getFaq } from "@/lib/content";
import { buildFaqPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Doğum, yenidoğan ve bebek çekimleri hakkında sık sorulan sorular ve yanıtları.",
  alternates: { canonical: "/sss" },
};

export const revalidate = 60;

export default async function FaqPage() {
  const faq = await getFaq();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqPageJsonLd(faq)),
        }}
      />
      <PageHeader
        eyebrow="SSS"
        title="Merak edilenler"
        description="Aklınıza takılan soruların yanıtlarını burada bulabilirsiniz."
      />

      <section className="container-page py-20">
        <div className="mx-auto max-w-3xl">
          <Accordion items={faq} />
        </div>

        <div className="mt-12 text-center">
          <p className="text-mocha">Sorunuz mu var?</p>
          <Button href="/iletisim" variant="outline" className="mt-4">
            Bize Ulaşın
          </Button>
        </div>
      </section>
    </>
  );
}
