import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getServices, getSiteSettings } from "@/lib/settings";

export async function ServicesGrid() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ]);
  const { home } = settings;

  return (
    <section className="container-page py-20">
      <SectionHeading
        eyebrow={home.servicesEyebrow}
        title={home.servicesTitle}
        description={home.servicesDescription}
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <Link
            key={service.slug}
            href={`/portfolyo/${service.slug}`}
            className="group flex flex-col rounded-2xl border border-espresso/10 bg-white/40 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg"
          >
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
              {service.short}
            </span>
            <h3 className="mt-3 text-xl text-espresso">{service.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-mocha">
              {service.description}
            </p>
            <span className="mt-6 text-sm font-medium text-espresso transition-colors group-hover:text-gold-dark">
              İncele →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
