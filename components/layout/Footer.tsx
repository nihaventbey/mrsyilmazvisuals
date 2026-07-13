import Link from "next/link";
import { navLinks } from "@/lib/site";
import { getServices } from "@/lib/settings";
import type { ContactChannel, SocialLink } from "@/lib/settings";

type Props = {
  siteName: string;
  tagline: string;
  location: string;
  contactChannels: ContactChannel[];
  socialLinks: SocialLink[];
};

export async function Footer({
  siteName,
  tagline,
  location,
  contactChannels,
  socialLinks,
}: Props) {
  const year = new Date().getFullYear();
  const services = await getServices();

  return (
    <footer className="mt-16 border-t border-espresso/10 bg-sand/40 sm:mt-24">
      <div className="container-page grid gap-10 py-12 sm:gap-12 sm:py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <p className="font-serif text-2xl text-espresso">{siteName}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mocha">
            {tagline}. Doğum, hamile, yenidoğan ve bebek çekimlerinde samimi
            anları ölümsüzleştiriyorum.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
            Menü
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-mocha transition-colors hover:text-espresso"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
            Hizmetler
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/portfolyo/${service.slug}`}
                  className="text-mocha transition-colors hover:text-espresso"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
            İletişim
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-mocha">
            {contactChannels.map((channel) => (
              <li key={channel.label}>
                {channel.href ? (
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-espresso"
                  >
                    {channel.value}
                  </a>
                ) : (
                  channel.value
                )}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-4 text-sm">
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
      </div>

      <div className="border-t border-espresso/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-mist sm:flex-row">
          <p>
            © {year} {siteName}. Tüm hakları saklıdır.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href="/gizlilik-politikasi"
              className="text-mocha transition-colors hover:text-espresso hover:underline hover:underline-offset-4"
            >
              Gizlilik Politikası
            </Link>
            <span>{location}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
