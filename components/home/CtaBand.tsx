import { Button } from "@/components/ui/Button";
import { getSiteSettings } from "@/lib/settings";

export async function CtaBand() {
  const { home } = await getSiteSettings();

  return (
    <section className="container-page py-20">
      <div className="relative overflow-hidden rounded-3xl bg-espresso px-8 py-16 text-center text-cream sm:px-16">
        <span
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(191,157,104,0.6), transparent 50%), radial-gradient(circle at 80% 80%, rgba(232,215,191,0.4), transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl text-cream sm:text-4xl">{home.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/80">
            {home.ctaDescription}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              href="/rezervasyon"
              size="lg"
              className="bg-cream text-espresso hover:bg-champagne"
            >
              Rezervasyon Oluştur
            </Button>
            <Button
              href="/iletisim"
              size="lg"
              variant="outline"
              className="border-cream/40 text-cream hover:border-cream hover:bg-cream/10"
            >
              İletişime Geç
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
