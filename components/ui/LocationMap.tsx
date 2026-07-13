import { toGoogleMapsEmbedUrl, toGoogleMapsLink } from "@/lib/maps";

type Props = {
  mapsUrl: string;
  locationLabel?: string;
  className?: string;
};

export function LocationMap({ mapsUrl, locationLabel, className }: Props) {
  const embedSrc = toGoogleMapsEmbedUrl(mapsUrl);
  const linkHref = toGoogleMapsLink(mapsUrl);

  if (!embedSrc || !linkHref) return null;

  const title = locationLabel
    ? `Konum haritası — ${locationLabel}`
    : "Konum haritası";

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-espresso/10 bg-sand/30">
        <iframe
          title={title}
          src={embedSrc}
          className="h-56 w-full sm:h-64"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <a
        href={linkHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex text-sm text-espresso underline-offset-4 transition-colors hover:text-gold-dark hover:underline"
      >
        Google Maps&apos;te aç
        <span aria-hidden className="ml-1">
          ↗
        </span>
      </a>
    </div>
  );
}
