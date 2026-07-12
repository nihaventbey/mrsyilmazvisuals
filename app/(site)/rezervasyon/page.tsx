import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookingForm } from "@/components/forms/BookingForm";
import { getServices } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Rezervasyon",
  description:
    "Bebek, doğum, hamile veya düğün çekiminiz için rezervasyon oluşturun. Tercih ettiğiniz tarihi ve konsepti paylaşın.",
};

const steps = [
  {
    title: "Formu doldurun",
    text: "Çekim türünü, tercih ettiğiniz tarihi ve varsa notlarınızı iletin.",
  },
  {
    title: "Birlikte planlayalım",
    text: "Müsaitlik durumunu teyit eder, konsept ve detayları konuşuruz.",
  },
  {
    title: "Anı ölümsüzleştirelim",
    text: "Kapora ile tarihi kesinleştirir, çekim gününe hazırlanırız.",
  },
];

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ tur?: string }>;
}) {
  const [params, services] = await Promise.all([
    searchParams,
    getServices(),
  ]);
  const tur = params.tur;

  return (
    <>
      <PageHeader
        eyebrow="Rezervasyon"
        title="Çekiminizi planlayalım"
        description="Aşağıdaki formu doldurarak rezervasyon talebinizi iletin. Kısa süre içinde müsaitlik durumunu teyit etmek için sizinle iletişime geçeceğim."
      />

      <section className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-2xl text-espresso">Nasıl işliyor?</h2>
            <div className="mt-8 space-y-8">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-espresso text-sm text-cream">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg text-espresso">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mocha">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-espresso/10 bg-white/40 p-8">
            <BookingForm defaultType={tur} services={services} />
          </div>
        </div>
      </section>
    </>
  );
}
