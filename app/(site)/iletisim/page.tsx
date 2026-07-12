import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import {
  getContactChannels,
  getSiteConfig,
  getSiteSettings,
  getSocialLinks,
} from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "İletişim",
    description: `Doğum, hamile, yenidoğan ve bebek çekimleri için ${config.author} ile iletişime geçin.`,
  };
}

export default async function ContactPage() {
  const [settings, contactChannels, socialLinks] = await Promise.all([
    getSiteSettings(),
    getContactChannels(),
    getSocialLinks(),
  ]);
  const { contact } = settings;

  return (
    <>
      <PageHeader
        eyebrow="İletişim"
        title={contact.pageTitle}
        description={contact.pageDescription}
      />

      <section className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl text-espresso">İletişim Bilgileri</h2>
            <dl className="mt-8 space-y-6">
              {contactChannels.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-espresso">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-gold-dark"
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
                Sosyal Medya
              </p>
              <div className="mt-3 flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-espresso underline-offset-4 transition-colors hover:text-gold-dark hover:underline"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-espresso/10">
              <iframe
                title={`Konum haritası — ${contact.location}`}
                src="https://www.openstreetmap.org/export/embed.html?bbox=29.00%2C41.01%2C29.08%2C41.05&layer=mapnik&marker=41.0225%2C29.0150"
                className="h-64 w-full"
                loading="lazy"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-espresso/10 bg-white/40 p-8">
            <h2 className="text-2xl text-espresso">Mesaj Gönderin</h2>
            <p className="mt-2 text-sm text-mocha">
              {contact.formNote}{" "}
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-espresso underline-offset-4 hover:underline"
              >
                Instagram
              </a>{" "}
              üzerinden de yazabilirsiniz.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
