import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { FeaturedGallery } from "@/components/home/FeaturedGallery";
import { AboutPreview } from "@/components/home/AboutPreview";
import { BlogPreview } from "@/components/home/BlogPreview";
import { CtaBand } from "@/components/home/CtaBand";
import { getSiteConfig } from "@/lib/settings";

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <>
      <Hero tagline={config.tagline} description={config.description} />
      <ServicesGrid />
      <FeaturedGallery />
      <AboutPreview />
      <BlogPreview />
      <CtaBand />
    </>
  );
}
