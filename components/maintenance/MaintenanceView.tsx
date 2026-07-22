import Link from "next/link";
import type { MaintenanceSettings } from "@/lib/maintenance";
import { SiteLogo } from "@/components/ui/SiteLogo";
import type { SiteConfig } from "@/lib/settings";
import { toWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  maintenance: MaintenanceSettings;
  config: SiteConfig;
  contactEmail?: string;
};

type ContactCard = {
  label: string;
  value: string;
  subtitle: string;
  href?: string;
  icon: "instagram" | "whatsapp" | "location" | "hours" | "email";
};

const SLOGAN = "HER KARE, BİR ÖMÜR SAKLANACAK BİR HİKÂYE.";
const TITLE = "Çok Yakında Sizlerle";
const DESCRIPTION_PARAGRAPHS = [
  "Web sitemiz üzerinde son dokunuşlarımızı yapıyoruz.",
  "Ankara'daki ev stüdyomuzda yenidoğan, hamile, doğum ve gelin & damat fotoğraf çekimleri için çok yakında rezervasyon almaya başlıyoruz.",
  "Bu süreçte bizimle Instagram veya sağ alttaki WhatsApp butonu üzerinden kolayca iletişime geçebilirsiniz.",
];

function ContactIcon({
  type,
}: {
  type: "instagram" | "whatsapp" | "location" | "hours" | "email";
}) {
  const paths = {
    instagram: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M6.5 21h11a4.5 4.5 0 0 0 4.5-4.5v-11A4.5 4.5 0 0 0 17.5 3h-11A4.5 4.5 0 0 0 2 7.5v11A4.5 4.5 0 0 0 6.5 21z"
      />
    ),
    whatsapp: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 14.5c1.6 1.6 3.7 2.3 5.5 1.7l1.2-.4c.3-.1.6 0 .8.2l2.2 2.2c.3.3.2.8-.2 1-.9.5-2 .7-3.1.5-2.7-.5-5.2-2.2-7-4-1.8-1.8-3.5-4.3-4-7-.2-1.1 0-2.2.5-3.1.2-.4.7-.5 1-.2l2.2 2.2c.2.2.3.5.2.8l-.4 1.2c-.6 1.8.1 3.9 1.7 5.5z"
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
    <span className="maintenance-card-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-cream/80 text-gold-dark transition-transform duration-500 ease-out">
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

function buildContactCards(
  config: SiteConfig,
  contactEmail?: string,
): ContactCard[] {
  const whatsappHref =
    config.whatsappUrl ?? toWhatsAppUrl(config.whatsappPhone) ?? undefined;
  const email = contactEmail?.trim() || "merhaba@mrsyilmaz.com";

  return [
    {
      label: "Instagram",
      value: "@ankara.yenidogan.fotograf",
      subtitle: "Yeni çalışmalarımızı ve duyurularımızı takip edin.",
      href: "https://www.instagram.com/ankara.yenidogan.fotograf/",
      icon: "instagram",
    },
    {
      label: "WhatsApp",
      value: "+90 544 975 83 38",
      subtitle:
        "Bilgi almak veya ön rezervasyon oluşturmak için bize yazabilirsiniz.",
      href: whatsappHref,
      icon: "whatsapp",
    },
    {
      label: "Konum",
      value: "Gölbaşı / Ankara",
      subtitle: "Ev stüdyomuz randevu sistemiyle hizmet vermektedir.",
      icon: "location",
    },
    {
      label: "Çalışma Şekli",
      value: "Randevu Sistemi",
      subtitle:
        "Tüm çekimler önceden planlanan rezervasyon sistemiyle gerçekleştirilmektedir.",
      icon: "hours",
    },
    {
      label: "E-posta",
      value: email,
      subtitle:
        "Sorularınız için dilediğiniz zaman bize e-posta gönderebilirsiniz.",
      href: `mailto:${email}`,
      icon: "email",
    },
  ];
}

export function MaintenanceView({
  maintenance: _maintenance,
  config,
  contactEmail,
}: Props) {
  const year = new Date().getFullYear();
  const contactItems = buildContactCards(config, contactEmail);
  const instagramHref = contactItems.find((c) => c.label === "Instagram")?.href;

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

      {/* Desktop-only soft cue toward the floating WhatsApp button */}
      <div
        aria-hidden
        className="maintenance-wa-guide pointer-events-none absolute right-4 bottom-16 z-20 hidden h-20 w-20 md:block sm:right-6 sm:bottom-20"
      >
        <span className="maintenance-wa-guide-ring absolute inset-0 rounded-full border border-gold/20" />
        <span className="maintenance-wa-guide-ring maintenance-wa-guide-ring-delay absolute inset-2 rounded-full border border-gold/15" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
        <div className="maintenance-card w-full max-w-2xl overflow-hidden rounded-[2rem] border border-espresso/10 bg-white/55 shadow-[0_32px_80px_-24px_rgba(59,46,38,0.18)] backdrop-blur-xl">
          <header className="border-b border-espresso/8 bg-gradient-to-b from-white/70 to-transparent px-8 pb-8 pt-10 text-center sm:px-12 sm:pt-12">
            <SiteLogo
              src={config.logoIcon}
              name={config.name}
              href={undefined}
              variant="mark"
              showName={false}
              className="mx-auto w-fit"
              imageClassName="h-20 w-20 rounded-2xl border-0 bg-transparent shadow-none"
            />
            <p className="mt-5 text-[11px] leading-relaxed tracking-[0.28em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.32em]">
              {SLOGAN}
            </p>
          </header>

          <section
            className="px-8 py-10 text-center sm:px-12 sm:py-12"
            aria-labelledby="coming-soon-title"
          >
            <div
              className="maintenance-badge mx-auto inline-flex items-center gap-2 rounded-full border border-gold/35 bg-champagne/45 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-gold-dark uppercase"
              role="status"
              aria-label="Çok yakında açılıyoruz"
            >
              <span className="maintenance-pulse h-1.5 w-1.5 rounded-full bg-gold" />
              Çok Yakında
            </div>

            <h1
              id="coming-soon-title"
              className="mt-8 font-serif text-3xl leading-tight text-espresso sm:text-4xl"
            >
              {TITLE}
            </h1>

            <div className="mx-auto mt-6 max-w-md space-y-4 text-base leading-relaxed text-mocha sm:text-lg">
              {DESCRIPTION_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div
              className="mt-10 flex justify-center gap-1.5"
              aria-hidden
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="maintenance-breathe h-1 w-8 rounded-full bg-gold/40"
                  style={{ animationDelay: `${i * 0.9}s` }}
                />
              ))}
            </div>
          </section>

          <section
            className="border-t border-espresso/8 px-8 py-9 text-center sm:px-12"
            aria-labelledby="pre-reservation-title"
          >
            <h2
              id="pre-reservation-title"
              className="font-serif text-xl leading-snug text-espresso sm:text-2xl"
            >
              İlk Rezervasyon Dönemimiz Açılıyor
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-mocha sm:text-base">
              İlk çekim takvimimiz oluşturulurken sınırlı sayıda rezervasyon
              kabul edeceğiz.
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mocha sm:text-base">
              Bilgi almak veya yerinizi erkenden planlamak isterseniz sağ alt
              köşedeki WhatsApp butonunu kullanarak bizimle iletişime
              geçebilirsiniz.
            </p>
          </section>

          <section
            className="border-t border-espresso/8 bg-sand/25 px-8 py-8 sm:px-12"
            aria-labelledby="contact-section-title"
          >
            <h2
              id="contact-section-title"
              className="text-center text-xs font-medium tracking-[0.22em] text-gold-dark uppercase"
            >
              Bize Ulaşın
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {contactItems.map((item) => (
                <li
                  key={item.label}
                  className={
                    item.label === "E-posta" ? "sm:col-span-2" : undefined
                  }
                >
                  <div className="maintenance-contact-card group flex items-start gap-3 rounded-2xl border border-espresso/8 bg-white/50 p-4">
                    <ContactIcon type={item.icon} />
                    <div className="min-w-0 text-left">
                      <p className="text-[11px] font-medium tracking-[0.15em] text-mocha uppercase">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={
                            item.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            item.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="mt-0.5 block truncate text-sm font-medium text-espresso transition-colors duration-300 hover:text-gold-dark focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                          aria-label={`${item.label}: ${item.value}`}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-espresso">
                          {item.value}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs leading-relaxed text-mocha">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="relative z-10 border-t border-espresso/8 bg-cream/60 px-6 py-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-4 text-center text-xs text-mocha sm:flex-row sm:text-left">
          <p>
            © {year} {config.name}. Tüm hakları saklıdır.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href="/gizlilik-politikasi"
              className="text-mocha transition-colors duration-300 hover:text-espresso hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              Gizlilik Politikası
            </Link>
            {instagramHref && (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mocha transition-colors duration-300 hover:text-espresso hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
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
