import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Gallery } from "@/components/portfolio/Gallery";
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
  if (!category) return { title: "Portfolyo" };
  return {
    title: category.title,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { kategori } = await params;
  const category = await getPortfolioCategory(kategori);
  if (!category) notFound();

  const others = (await getPortfolioCategories()).filter(
    (c) => c.slug !== category.slug,
  );

  return (
    <>
      <PageHeader
        eyebrow="Portfolyo"
        title={category.title}
        description={category.description}
      />

      <section className="container-page py-20">
        <Gallery images={category.images} />
      </section>

      <section className="border-t border-espresso/10 bg-sand/40 py-16">
        <div className="container-page text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-dark">
            Diğer kategoriler
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                href={`/portfolyo/${c.slug}`}
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
