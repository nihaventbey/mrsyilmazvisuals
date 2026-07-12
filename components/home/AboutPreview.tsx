import { Button } from "@/components/ui/Button";
import { AuthorPhoto } from "@/components/ui/AuthorPhoto";
import { getSiteConfig, getSiteSettings } from "@/lib/settings";

export async function AboutPreview() {
  const [config, settings] = await Promise.all([
    getSiteConfig(),
    getSiteSettings(),
  ]);

  return (
    <section className="container-page py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <AuthorPhoto
          src={config.profileImage}
          alt={config.author}
          className="aspect-[4/5] max-w-md lg:mx-0"
        />
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gold-dark">
            Hakkımda
          </p>
          <h2 className="text-3xl leading-tight text-espresso sm:text-4xl">
            Merhaba, ben {config.author}
          </h2>
          {settings.about.previewParagraphs.map((paragraph) => (
            <p key={paragraph} className="mt-6 leading-relaxed text-mocha">
              {paragraph}
            </p>
          ))}
          <Button href="/hakkimda" variant="outline" className="mt-8">
            Hikâyemi Oku
          </Button>
        </div>
      </div>
    </section>
  );
}
