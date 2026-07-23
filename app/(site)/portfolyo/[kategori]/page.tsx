import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { Button } from "@/components/ui/Button";
import { Gallery } from "@/components/portfolio/Gallery";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  getPortfolioCategories,
  getPortfolioCategory,
} from "@/lib/content";

type Params = { kategori: string };

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getPortfolioCategories();
  return categories.map((category) => ({
    kategori: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const category = await getPortfolioCategory(kategori);
  if (!category || category.parentSlug) return { title: "Portfolyo" };
  return {
    title: category.title,
    description: category.description,
    alternates: { canonical: category.href },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { kategori } = await params;
  const category = await getPortfolioCategory(kategori);
  if (!category || category.parentSlug) notFound();

  const children = category.children ?? [];
  const others = (await getPortfolioCategories()).filter(
    (c) => c.slug !== category.slug,
  );

  return (
    <>
      <PageHeader
        eyebrow={category.short || "Portfolyo"}
        title={category.title}
        description={category.description}
      />

      {children.length > 0 && (
        <section className="container-page py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child, i) => (
              <Link key={child.slug} href={child.href} className="group">
                <div className="overflow-hidden rounded-2xl">
                  <Placeholder
                    index={i}
                    label={child.title}
                    rounded={false}
                    className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-gold-dark">
                  {child.short}
                </p>
                <h2 className="mt-1 text-xl text-espresso transition-colors group-hover:text-gold-dark">
                  {child.title}
                </h2>
                <p className="mt-1 text-sm text-mocha line-clamp-2">
                  {child.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {category.images.length > 0 && (
        <section className="container-page py-12">
          {children.length > 0 && (
            <h2 className="mb-8 font-serif text-2xl text-espresso">
              Seçilmiş kareler
            </h2>
          )}
          <Gallery images={category.images} />
        </section>
      )}

      {children.length === 0 && category.images.length === 0 && (
        <section className="container-page py-20">
          <p className="text-center text-mocha">
            Bu kategoride henüz görsel yok.
          </p>
        </section>
      )}

      <AdSlot slot="portfolioAfterGallery" />

      <section className="border-t border-espresso/10 bg-sand/40 py-16">
        <div className="container-page text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-dark">
            Diğer kategoriler
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                href={c.href}
                className="rounded-full border border-espresso/20 px-5 py-2 text-sm text-espresso transition-colors hover:border-espresso hover:bg-espresso/5"
              >
                {c.title}
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <Button href="/rezervasyon" size="lg">
              Bu Tür İçin Rezervasyon Oluştur
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
