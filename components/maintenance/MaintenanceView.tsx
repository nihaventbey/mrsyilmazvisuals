import Image from "next/image";
import Link from "next/link";
import type { MaintenanceSettings } from "@/lib/maintenance";
import type { ContactChannel, SiteConfig } from "@/lib/settings";

type Props = {
  maintenance: MaintenanceSettings;
  config: SiteConfig;
  contactChannels: ContactChannel[];
  contactEmail?: string;
};

function ContactIcon({ type }: { type: "instagram" | "location" | "hours" | "email" }) {
  const paths = {
    instagram: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M6.5 21h11a4.5 4.5 0 0 0 4.5-4.5v-11A4.5 4.5 0 0 0 17.5 3h-11A4.5 4.5 0 0 0 2 7.5v11A4.5 4.5 0 0 0 6.5 21z"
      />
    ),
    location: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"
      />
    ),
    hours: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
      />
    ),
    email: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16v10H4V7zm0 0 8 6 8-6"
      />
    ),
  };

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-cream/80 text-gold-dark">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
        aria-hidden
      >
        {paths[type]}
      </svg>
    </span>
  );
}

function channelIcon(label: string): "instagram" | "location" | "hours" | "email" {
  if (label.toLowerCase().includes("instagram")) return "instagram";
  if (label.toLowerCase().includes("konum")) return "location";
  if (label.toLowerCase().includes("saat")) return "hours";
  return "email";
}

export function MaintenanceView({
  maintenance,
  config,
  contactChannels,
  contactEmail,
}: Props) {
  const year = new Date().getFullYear();
  const contactItems = [
    ...contactChannels,
    ...(contactEmail
      ? [
          {
            label: "E-posta",
            value: contactEmail,
            href: `mailto:${contactEmail}`,
          },
        ]
      : []),
  ];

  return (
    <div className="maintenance-scene relative flex min-h-full flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#f4e8d3_0%,#fbf7f0_45%,#f6efe2_100%)]" />
        <div className="maintenance-orb absolute -left-24 top-20 h-72 w-72 rounded-full bg-champagne/50 blur-3xl" />
        <div className="maintenance-orb maintenance-orb-delay absolute -right-16 bottom-32 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-px w-[min(90vw,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
        <div className="maintenance-card w-full max-w-2xl overflow-hidden rounded-[2rem] border border-espresso/10 bg-white/55 shadow-[0_32px_80px_-24px_rgba(59,46,38,0.18)] backdrop-blur-xl">
          <div className="border-b border-espresso/8 bg-gradient-to-b from-white/70 to-transparent px-8 pb-8 pt-10 text-center sm:px-12 sm:pt-12">
            <div className="relative mx-auto mb-6 h-24 w-24 sm:h-28 sm:w-28">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gold/60 via-champagne to-gold-dark/40 opacity-80" />
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-cream bg-sand/60 shadow-inner">
                <Image
                  src={config.profileImage}
                  alt={config.author}
                  fill
                  priority
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            </div>

            <p className="font-serif text-2xl tracking-wide text-espresso sm:text-3xl">
              {config.name}
            </p>
            <p className="mt-2 text-sm tracking-[0.22em] text-gold-dark uppercase">
              {config.tagline}
            </p>
          </div>

          <div className="px-8 py-10 text-center sm:px-12 sm:py-12">
            <div className="maintenance-badge mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-champagne/40 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-gold-dark uppercase">
              <span className="maintenance-pulse h-1.5 w-1.5 rounded-full bg-gold" />
              Bakım Modu
            </div>

            <h1 className="mt-8 font-serif text-3xl leading-tight text-espresso sm:text-4xl">
              {maintenance.title}
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-mocha sm:text-lg">
              {maintenance.message}
            </p>

            <div className="mt-10 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="maintenance-dot h-1 w-8 rounded-full bg-gold/35"
                  style={{ animationDelay: `${i * 0.35}s` }}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-espresso/8 bg-sand/25 px-8 py-8 sm:px-12">
            <p className="text-center text-xs font-medium tracking-[0.2em] text-gold-dark uppercase">
              İletişim
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {contactItems.map((item) => (
                <li key={item.label}>
                  <div className="flex items-start gap-3 rounded-2xl border border-espresso/8 bg-white/50 p-4 transition-colors hover:border-gold/30 hover:bg-white/70">
                    <ContactIcon type={channelIcon(item.label)} />
                    <div className="min-w-0 text-left">
                      <p className="text-[11px] font-medium tracking-[0.15em] text-mist uppercase">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={
                            item.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="mt-0.5 block truncate text-sm text-espresso transition-colors hover:text-gold-dark"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm text-espresso">{item.value}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-espresso/8 bg-cream/60 px-6 py-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-4 text-center text-xs text-mist sm:flex-row sm:text-left">
          <p>
            © {year} {config.name}. Tüm hakları saklıdır.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href="/gizlilik-politikasi"
              className="text-mocha transition-colors hover:text-espresso hover:underline hover:underline-offset-4"
            >
              Gizlilik Politikası
            </Link>
            {contactChannels.find((c) => c.label === "Instagram")?.href && (
              <a
                href={
                  contactChannels.find((c) => c.label === "Instagram")!.href!
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-mocha transition-colors hover:text-espresso hover:underline hover:underline-offset-4"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
