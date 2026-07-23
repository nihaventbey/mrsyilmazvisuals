import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Gallery } from "@/components/portfolio/Gallery";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  getCategoryRows,
  getPortfolioSubcategory,
} from "@/lib/portfolio-categories";

type Params = { kategori: string; alt: string };

export const revalidate = 60;

export async function generateStaticParams() {
  const rows = await getCategoryRows();
  const byId = new Map(rows.map((r) => [r.id, r]));
  return rows
    .filter((r) => r.parent_id)
    .map((child) => {
      const parent = child.parent_id ? byId.get(child.parent_id) : null;
      if (!parent) return null;
      return { kategori: parent.slug, alt: child.slug };
    })
    .filter((p): p is { kategori: string; alt: string } => Boolean(p));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { kategori, alt } = await params;
  const category = await getPortfolioSubcategory(kategori, alt);
  if (!category) return { title: "Portfolyo" };
  return {
    title: `${category.title} | Portfolyo`,
    description: category.description,
    alternates: { canonical: category.href },
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { kategori, alt } = await params;
  const category = await getPortfolioSubcategory(kategori, alt);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        eyebrow={category.short || kategori}
        title={category.title}
        description={category.description}
      />

      <section className="container-page py-20">
        <Gallery images={category.images} />
      </section>

      <AdSlot slot="portfolioAfterGallery" />

      <section className="border-t border-espresso/10 bg-sand/40 py-16">
        <div className="container-page text-center">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/portfolyo/${kategori}`}
              className="rounded-full border border-espresso/20 px-5 py-2 text-sm text-espresso transition-colors hover:border-espresso hover:bg-espresso/5"
            >
              ← Tüm {kategori} kategorileri
            </Link>
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
