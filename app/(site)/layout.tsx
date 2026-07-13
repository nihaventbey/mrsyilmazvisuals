import {
  getContactChannels,
  getSiteConfig,
  getSocialLinks,
} from "@/lib/settings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdSenseScript } from "@/components/ads/AdSenseScript";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, contactChannels, socialLinks] = await Promise.all([
    getSiteConfig(),
    getContactChannels(),
    getSocialLinks(),
  ]);

  return (
    <>
      <AdSenseScript />
      <Header siteName={config.name} logoSrc={config.logoImage} />
      <main className="flex-1">{children}</main>
      <Footer
        siteName={config.name}
        tagline={config.tagline}
        location={config.location}
        contactChannels={contactChannels}
        socialLinks={socialLinks}
      />
    </>
  );
}
