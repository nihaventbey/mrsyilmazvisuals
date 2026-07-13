import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { LocationMap } from "@/components/ui/LocationMap";
import {
  getContactChannels,
  getSiteSettings,
  getSocialLinks,
} from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "İletişim",
    description: settings.contact.pageDescription,
  };
}

export default async function ContactPage() {
  const [settings, contactChannels, socialLinks] = await Promise.all([
    getSiteSettings(),
    getContactChannels(),
    getSocialLinks(),
  ]);
  const { contact } = settings;
  const hasMap = Boolean(contact.mapsUrl?.trim());

  return (
    <>
      <PageHeader
        eyebrow="İletişim"
        title={contact.pageTitle}
        description={contact.pageDescription}
      />

      <section className="container-page py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-2">
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

            {hasMap && (
              <LocationMap
                mapsUrl={contact.mapsUrl}
                locationLabel={contact.location}
                className="mt-8"
              />
            )}
          </div>

          <div className="rounded-3xl border border-espresso/10 bg-white/40 p-6 sm:p-8">
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
