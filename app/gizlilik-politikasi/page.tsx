import type { Metadata } from "next";
import Link from "next/link";
import { isMaintenanceActive } from "@/lib/maintenance";
import { getLegalSettings } from "@/lib/legal";
import { getSiteConfig } from "@/lib/settings";
import { getAdSenseSettings } from "@/lib/adsense";
import { absoluteUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Gizlilik Politikası",
    description: `${config.name} gizlilik politikası: kişisel veriler, çekim süreçleri, fotoğraf hakları ve KVKK haklarınız.`,
    alternates: {
      canonical: absoluteUrl("/gizlilik-politikasi", config.url),
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPolicyPage() {
  const [config, legal, maintenanceActive, adsense] = await Promise.all([
    getSiteConfig(),
    getLegalSettings(),
    isMaintenanceActive(),
    getAdSenseSettings(),
  ]);

  const updatedAt = new Date(legal.privacyUpdatedAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-full bg-cream">
      <div className="border-b border-espresso/10 bg-sand/30">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            href={maintenanceActive ? "/bakim" : "/"}
            className="font-serif text-lg text-espresso transition-colors hover:text-gold-dark"
          >
            ← {maintenanceActive ? "Bakım Sayfası" : "Ana Sayfa"}
          </Link>
          <p className="hidden text-xs tracking-[0.15em] text-mist uppercase sm:block">
            {config.name}
          </p>
        </div>
      </div>

      <article className="container-page py-16 sm:py-20">
        <header className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.25em] text-gold-dark uppercase">
            Yasal
          </p>
          <h1 className="mt-3 font-serif text-4xl text-espresso sm:text-5xl">
            Gizlilik Politikası
          </h1>
          <p className="mt-4 text-mocha">Son güncelleme: {updatedAt}</p>
        </header>

        <div className="prose-content mt-12 max-w-3xl">
          <p>
            Bu gizlilik politikası, <strong>{config.name}</strong> (
            {config.url}) web sitesini ziyaret ettiğinizde, iletişim ve
            rezervasyon formlarını kullandığınızda ve fotoğraf çekimi
            hizmetlerinden yararlandığınızda kişisel verilerinizin nasıl
            toplandığını, kullanıldığını ve korunduğunu açıklar.
          </p>
          <p>{legal.privacyIntro}</p>

          <h2>Veri Sorumlusu</h2>
          <p>
            Veri sorumlusu: <strong>{config.author}</strong>
            <br />
            Ticari unvan / marka: <strong>{config.name}</strong>
            <br />
            Konum: {config.location}
            {process.env.CONTACT_EMAIL ? (
              <>
                <br />
                E-posta:{" "}
                <a href={`mailto:${process.env.CONTACT_EMAIL}`}>
                  {process.env.CONTACT_EMAIL}
                </a>
              </>
            ) : null}
          </p>

          {legal.sections.map((section) => (
            <section key={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {adsense.enabled && adsense.publisherId ? (
            <section>
              <h2>Google AdSense</h2>
              <p>
                Bu sitede Google AdSense reklam programı kullanılmaktadır
                (Publisher: <code>{adsense.publisherId}</code>). Google;
                cihaz bilgisi, yaklaşık konum ve çerezler aracılığıyla reklam
                deneyimini kişiselleştirebilir veya ölçebilir. Ayrıntılar için{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google reklam teknolojileri
                </a>{" "}
                sayfasına bakabilirsiniz.
              </p>
            </section>
          ) : null}

          <h2>İletişim</h2>
          <p>
            Gizlilik ve kişisel veri talepleriniz için{" "}
            {process.env.CONTACT_EMAIL ? (
              <a href={`mailto:${process.env.CONTACT_EMAIL}`}>
                {process.env.CONTACT_EMAIL}
              </a>
            ) : (
              "iletişim formu veya Instagram üzerinden"
            )}{" "}
            bize ulaşabilirsiniz.
          </p>
        </div>
      </article>
    </div>
  );
}
