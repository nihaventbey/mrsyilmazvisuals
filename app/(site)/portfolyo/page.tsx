import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { PortfolioImage } from "@/components/portfolio/PortfolioImage";
import { getPortfolioCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portfolyo",
  description:
    "Bebek, doğum, hamile ve düğün çekimlerinden seçkiler. Kategorilere göz atın ve tarzımı keşfedin.",
  alternates: { canonical: "/portfolyo" },
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const categories = await getPortfolioCategories();

  return (
    <>
      <PageHeader
        eyebrow="Portfolyo"
        title="Objektifimden anlar"
        description="Her kategori kendi hikâyesini anlatıyor. Keşfetmek istediğiniz alanı seçin."
      />

      <section className="container-page py-20">
        <div className="grid gap-10 md:grid-cols-2">
          {categories.map((category, i) => (
            <Link
              key={category.slug}
              href={`/portfolyo/${category.slug}`}
              className="group"
            >
              <div className="overflow-hidden rounded-2xl">
                {category.images[0]?.imageUrl ? (
                  <PortfolioImage
                    src={category.images[0].imageUrl}
                    alt={category.title}
                    className="aspect-[3/2] w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <Placeholder
                    index={i}
                    label={category.title}
                    rounded={false}
                    className="aspect-[3/2] w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="mt-5">
                <h2 className="text-2xl text-espresso transition-colors group-hover:text-gold-dark">
                  {category.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mocha">
                  {category.description}
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-espresso">
                  Galeriyi Aç →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
