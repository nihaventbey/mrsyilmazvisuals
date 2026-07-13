import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getInstagramFeed } from "@/lib/instagram";
import { getSiteSettings } from "@/lib/settings";

export async function InstagramFeed() {
  const [{ settings, posts }, siteSettings] = await Promise.all([
    getInstagramFeed(),
    getSiteSettings(),
  ]);

  if (!settings.enabled || posts.length === 0) return null;

  const { instagramHandle, instagramUrl } = siteSettings.contact;

  return (
    <section className="border-t border-espresso/10 bg-cream py-12 sm:py-16 lg:py-20">
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
          <SectionHeading
            eyebrow={settings.eyebrow}
            title={settings.title}
            description={`${instagramHandle} hesabındaki son kareler.`}
            align="left"
            className="mb-0 max-w-full sm:max-w-2xl"
          />
          <Link
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-espresso/20 px-5 py-2.5 text-sm text-espresso transition-colors hover:border-espresso hover:bg-espresso/5 sm:w-auto"
          >
            Instagram&apos;da Takip Et
            <span aria-hidden>↗</span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-sand/60 sm:rounded-2xl"
              aria-label="Instagram gönderisini aç"
            >
              <Image
                src={post.imageUrl!}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={post.imageUrl!.includes("cdninstagram.com")}
              />
              <span className="absolute inset-0 bg-espresso/0 transition-colors group-hover:bg-espresso/15" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
