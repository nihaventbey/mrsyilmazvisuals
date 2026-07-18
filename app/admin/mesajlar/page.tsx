import { createClient } from "@/lib/supabase/server";
import { deleteMessage, toggleMessageRead } from "@/app/admin/actions";
import { formatDate } from "@/lib/content";
import { cn } from "@/lib/utils";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, message, is_read, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Mesajlar</h1>

      <div className="mt-8 space-y-4">
        {(messages ?? []).map((message) => (
          <div
            key={message.id}
            className={cn(
              "rounded-2xl border p-6",
              message.is_read
                ? "border-espresso/10 bg-white/40"
                : "border-gold/40 bg-white/70",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-espresso">
                  {message.name}
                  {!message.is_read && (
                    <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold-dark">
                      Yeni
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-mocha">
                  {message.email}
                  {message.phone && ` · ${message.phone}`}
                </p>
              </div>
              <span className="text-xs text-mist">
                {formatDate(message.created_at)}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-mocha">
              {message.message}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <a
                href={`mailto:${message.email}?subject=${encodeURIComponent("Re: Mrs. Yılmaz Visuals — mesajınız hakkında")}`}
                className="text-espresso hover:underline"
              >
                Yanıtla
              </a>
              <form action={toggleMessageRead}>
                <input type="hidden" name="id" value={message.id} />
                <input
                  type="hidden"
                  name="next"
                  value={String(!message.is_read)}
                />
                <button
                  type="submit"
                  className="text-gold-dark hover:underline"
                >
                  {message.is_read
                    ? "Okunmadı olarak işaretle"
                    : "Okundu olarak işaretle"}
                </button>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={message.id} />
                <button
                  type="submit"
                  className="text-red-700 hover:text-red-900"
                >
                  Sil
                </button>
              </form>
            </div>
          </div>
        ))}
        {(messages ?? []).length === 0 && (
          <p className="rounded-2xl border border-espresso/10 bg-white/50 p-8 text-center text-mist">
            Henüz mesaj yok.
          </p>
        )}
      </div>
    </div>
  );
}
