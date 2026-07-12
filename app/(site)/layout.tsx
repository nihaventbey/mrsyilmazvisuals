import {
  getContactChannels,
  getSiteConfig,
  getSocialLinks,
} from "@/lib/settings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
      <Header siteName={config.name} />
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
