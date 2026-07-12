import type { Metadata } from "next";
import Link from "next/link";
import { getMaintenanceSettings } from "@/lib/maintenance";
import { getSiteConfig, getSocialLinks } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Bakım Modu",
  robots: { index: false, follow: false },
};

export default async function MaintenancePage() {
  const [maintenance, config, socialLinks] = await Promise.all([
    getMaintenanceSettings(),
    getSiteConfig(),
    getSocialLinks(),
  ]);

  const instagram = socialLinks.find((link) =>
    link.href.includes("instagram"),
  );

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
          {config.name}
        </p>
        <h1 className="mt-4 font-serif text-4xl text-espresso sm:text-5xl">
          {maintenance.title}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-mocha">
          {maintenance.message}
        </p>

        {instagram && (
          <Link
            href={instagram.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-espresso/15 bg-white/60 px-6 py-3 text-sm text-espresso transition-colors hover:border-gold hover:text-gold-dark"
          >
            Instagram&apos;dan ulaşın
          </Link>
        )}

        <div className="mt-16 flex justify-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:0.2s]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
