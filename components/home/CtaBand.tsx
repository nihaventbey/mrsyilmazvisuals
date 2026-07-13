import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";

export async function CtaBand() {
  const { home } = await getSiteSettings();

  return (
    <section className="container-page py-16 sm:py-20 lg:py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-espresso px-6 py-14 text-center sm:px-12 sm:py-16 lg:px-20 lg:py-20">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-gold/25 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 right-[-10%] h-72 w-72 rounded-full bg-champagne/20 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-cream/10 sm:inset-5"
        />

        <div className="relative">
          <p className="text-[11px] font-medium tracking-[0.28em] text-gold uppercase">
            Bir sonraki kare
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight text-cream sm:text-4xl lg:text-[2.75rem]">
            {home.ctaTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-cream/75 sm:text-lg">
            {home.ctaDescription}
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/rezervasyon"
              className="inline-flex items-center justify-center rounded-full bg-cream px-8 py-3.5 text-sm font-medium tracking-wide text-espresso shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-espresso"
            >
              Rezervasyon Oluştur
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center rounded-full border border-cream/45 bg-transparent px-8 py-3.5 text-sm font-medium tracking-wide text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-cream hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-espresso"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
