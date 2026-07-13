import { GiveawayForm } from "@/components/admin/GiveawayForm";

export default function NewGiveawayPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Yeni Çekiliş</h1>
      <div className="mt-8">
        <GiveawayForm />
      </div>
    </div>
  );
}
