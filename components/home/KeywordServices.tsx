import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSeoSettings } from "@/lib/seo-keywords";

export async function KeywordServices() {
  const seo = await getSeoSettings();
  if (seo.keywords.length === 0) return null;

  return (
    <section className="border-y border-espresso/8 bg-sand/30">
      <div className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={seo.sectionEyebrow}
          title={seo.sectionTitle}
          description={seo.sectionDescription}
        />

        <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5 sm:gap-3">
          {seo.keywords.map((keyword) => (
            <li key={keyword}>
              <span className="inline-block rounded-full border border-espresso/12 bg-cream/80 px-3.5 py-1.5 text-sm text-espresso sm:px-4 sm:py-2">
                {keyword}
              </span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-mocha">
          Bebek ve aile çekimleri için{" "}
          <Link
            href="/portfolyo"
            className="font-medium text-espresso underline-offset-4 transition-colors hover:text-gold-dark hover:underline"
          >
            portfolyoya göz atın
          </Link>{" "}
          veya{" "}
          <Link
            href="/rezervasyon"
            className="font-medium text-espresso underline-offset-4 transition-colors hover:text-gold-dark hover:underline"
          >
            rezervasyon oluşturun
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
