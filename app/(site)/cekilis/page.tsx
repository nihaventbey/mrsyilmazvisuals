import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/content";
import {
  getPublishedGiveaways,
  instagramProfileUrl,
} from "@/lib/giveaways";

export const metadata: Metadata = {
  title: "Çekilişler",
  description:
    "Mrs. Yılmaz Visuals Instagram çekiliş sonuçları — kazananlar ve yedekler.",
  alternates: { canonical: "/cekilis" },
};

export const revalidate = 60;

function UsernameList({
  title,
  usernames,
}: {
  title: string;
  usernames: string[];
}) {
  if (usernames.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
        {title}
      </h3>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {usernames.map((username) => (
          <li key={`${title}-${username}`}>
            <a
              href={instagramProfileUrl(username)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-espresso transition-colors hover:text-gold-dark"
            >
              @{username}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function GiveawaysPage() {
  const giveaways = await getPublishedGiveaways();

  return (
    <>
      <PageHeader
        eyebrow="Çekilişler"
        title="Sonuçlar"
        description="Instagram çekilişlerimizin kazanan ve yedek kullanıcıları burada listelenir."
      />

      <section className="container-page py-12 sm:py-16 lg:py-20">
        {giveaways.length === 0 ? (
          <p className="text-center text-mocha">
            Henüz yayınlanmış çekiliş sonucu yok.
          </p>
        ) : (
          <div className="mx-auto max-w-3xl space-y-14">
            {giveaways.map((giveaway) => (
              <article
                key={giveaway.id}
                className="border-b border-espresso/10 pb-14 last:border-b-0 last:pb-0"
              >
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
                  {formatDate(giveaway.drawDate)}
                </p>
                <h2 className="mt-2 font-serif text-2xl text-espresso sm:text-3xl">
                  {giveaway.title}
                </h2>
                {giveaway.description ? (
                  <p className="mt-3 text-mocha">{giveaway.description}</p>
                ) : null}
                <div className="mt-8 space-y-8">
                  <UsernameList
                    title="Kazananlar"
                    usernames={giveaway.winners.map((w) => w.username)}
                  />
                  <UsernameList
                    title="Yedekler"
                    usernames={giveaway.backups.map((b) => b.username)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
