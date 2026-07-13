import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { AuthorPhoto } from "@/components/ui/AuthorPhoto";
import { Button } from "@/components/ui/Button";
import {
  getSiteConfig,
  getSiteSettings,
  getSocialLinks,
} from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Hakkımda",
    description: `${config.author} kimdir? Doğum, hamile, yenidoğan ve bebek fotoğrafçılığındaki yaklaşımı ve hikâyesi.`,
  };
}

export default async function AboutPage() {
  const [config, settings, socialLinks] = await Promise.all([
    getSiteConfig(),
    getSiteSettings(),
    getSocialLinks(),
  ]);
  const { about } = settings;

  return (
    <>
      <PageHeader
        eyebrow="Hakkımda"
        title={`Merhaba, ben ${config.author}`}
        description={about.pageDescription}
      />

      <section className="container-page py-20">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <AuthorPhoto
            src={config.aboutImage}
            alt={config.author}
            className="aspect-[4/5]"
            priority
          />
          <div>
            <h2 className="text-2xl text-espresso sm:text-3xl">Hikâyem</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-mocha">
              {about.bioParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-espresso/20 px-5 py-2 text-sm text-espresso transition-colors hover:border-espresso hover:bg-espresso/5"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand/40 py-20">
        <div className="container-page">
          <h2 className="text-center text-2xl text-espresso sm:text-3xl">
            Yaklaşımım
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {about.values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-white/50 p-8 text-center"
              >
                <h3 className="text-xl text-espresso">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mocha">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="text-center text-2xl text-espresso sm:text-3xl">
          Yolculuğum
        </h2>
        <div className="mx-auto mt-12 max-w-2xl">
          {about.timeline.map((item, i) => (
            <div
              key={`${item.year}-${item.title}`}
              className="relative flex gap-6 pb-10 last:pb-0"
            >
              <div className="flex flex-col items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-espresso text-sm text-cream">
                  {item.year.slice(2)}
                </span>
                {i < about.timeline.length - 1 && (
                  <span className="mt-2 w-px flex-1 bg-espresso/15" />
                )}
              </div>
              <div className="pt-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
                  {item.year}
                </p>
                <h3 className="mt-1 text-lg text-espresso">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mocha">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button href="/rezervasyon" size="lg">
            Birlikte Çalışalım
          </Button>
        </div>
      </section>
    </>
  );
}
