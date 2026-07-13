import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GiveawayForm } from "@/components/admin/GiveawayForm";

export default async function EditGiveawayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("giveaways")
    .select(
      "id, title, slug, draw_date, description, published, giveaway_entrants(role, username, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  const entrants = (row.giveaway_entrants ?? [])
    .slice()
    .sort(
      (a, b) =>
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
    );

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Çekilişi Düzenle</h1>
      <div className="mt-8">
        <GiveawayForm
          giveaway={{
            id: row.id,
            title: row.title,
            slug: row.slug,
            drawDate: row.draw_date,
            description: row.description ?? "",
            published: row.published,
            winners: entrants
              .filter((e) => e.role === "winner")
              .map((e) => e.username),
            backups: entrants
              .filter((e) => e.role === "backup")
              .map((e) => e.username),
          }}
        />
      </div>
    </div>
  );
}
