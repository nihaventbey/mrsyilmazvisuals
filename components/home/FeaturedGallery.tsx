import { Button } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Placeholder";
import { PortfolioImage } from "@/components/portfolio/PortfolioImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedImages } from "@/lib/content";

export async function FeaturedGallery() {
  const featured = await getFeaturedImages();

  return (
    <section className="bg-sand/40 py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Portfolyo"
          title="Öne çıkan kareler"
          description="Objektifimden yansıyan bazı özel anlar. Tüm koleksiyonu portfolyo sayfasında keşfedebilirsiniz."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((image, index) =>
            image.imageUrl ? (
              <PortfolioImage
                key={image.id}
                src={image.imageUrl}
                alt={image.caption}
                className="aspect-square rounded-2xl"
              />
            ) : (
              <Placeholder
                key={image.id}
                index={index}
                label={image.caption}
                className="aspect-square"
              />
            ),
          )}
        </div>

        <div className="mt-12 text-center">
          <Button href="/portfolyo" variant="outline" size="lg">
            Tüm Portfolyoyu Gör
          </Button>
        </div>
      </div>
    </section>
  );
}
