import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getInstagramFeed } from "@/lib/instagram";
import { getSiteSettings } from "@/lib/settings";

/**
 * Instagram CDN hosts are multi-level (e.g. instagram.*.fna.fbcdn.net).
 * next/image remotePatterns can throw and wipe the section — use a plain img.
 */
function FeedImage({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

export async function InstagramFeed() {
  const [{ settings, posts, emptyReason }, siteSettings] = await Promise.all([
    getInstagramFeed(),
    getSiteSettings(),
  ]);

  if (!settings.enabled) return null;

  // Production: hide empty feed (don’t flash a broken CTA block).
  // Development: keep the section so missing .env is obvious.
  if (posts.length === 0 && process.env.NODE_ENV === "production") {
    return null;
  }

  const { instagramHandle, instagramUrl } = siteSettings.contact;

  return (
    <section className="relative z-10 border-t border-espresso/10 bg-cream py-12 sm:py-16 lg:py-20">
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

        {posts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left text-sm text-amber-950 sm:mt-10">
            <p className="font-medium">Instagram gönderileri yüklenemedi</p>
            <p className="mt-2 text-amber-900/90">
              {emptyReason ??
                "Bilinmeyen neden. Admin → Instagram → Bağlantıyı Test Et."}
            </p>
            <p className="mt-3 text-xs text-amber-900/70">
              Not: CMS’de “göster” yeterli değil; bu makinede{" "}
              <code className="rounded bg-white/80 px-1">.env.local</code> içinde{" "}
              <code className="rounded bg-white/80 px-1">INSTAGRAM_ACCESS_TOKEN</code>{" "}
              olmalı, sonra dev sunucusunu yeniden başlatın.
            </p>
          </div>
        ) : (
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
                <FeedImage src={post.imageUrl!} />
                <span className="absolute inset-0 bg-espresso/0 transition-colors group-hover:bg-espresso/15" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
