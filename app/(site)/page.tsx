import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { FeaturedGallery } from "@/components/home/FeaturedGallery";
import { AboutPreview } from "@/components/home/AboutPreview";
import { BlogPreview } from "@/components/home/BlogPreview";
import { CtaBand } from "@/components/home/CtaBand";
import { InstagramFeed } from "@/components/home/InstagramFeed";
import { AdSlot } from "@/components/ads/AdSlot";
import { getHeroCards } from "@/lib/hero";
import { getSiteConfig } from "@/lib/settings";

export default async function HomePage() {
  const [config, heroCards] = await Promise.all([
    getSiteConfig(),
    getHeroCards(),
  ]);

  return (
    <>
      <Hero
        tagline={config.tagline}
        description={config.description}
        cards={heroCards}
      />
      <ServicesGrid />
      <FeaturedGallery />
      <AboutPreview />
      <BlogPreview />
      <AdSlot slot="homeAfterBlog" />
      <CtaBand />
      <AdSlot slot="homeAfterCta" />
      <InstagramFeed />
    </>
  );
}
