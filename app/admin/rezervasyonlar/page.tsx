import { createClient } from "@/lib/supabase/server";
import { deleteBooking, updateBookingStatus } from "@/app/admin/actions";
import { formatDate } from "@/lib/content";

const typeLabels: Record<string, string> = {
  bebek: "Bebek",
  dogum: "Doğum",
  hamile: "Hamile",
  dugun: "Düğün",
};

const statusLabels: Record<string, string> = {
  new: "Yeni",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, name, email, phone, shoot_type, preferred_date, location, notes, status, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Rezervasyonlar</h1>

      <div className="mt-8 space-y-4">
        {(bookings ?? []).map((booking) => (
          <div
            key={booking.id}
            className="rounded-2xl border border-espresso/10 bg-white/50 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium text-espresso">
                  {booking.name}
                  <span className="ml-2 rounded-full bg-champagne px-2 py-0.5 text-xs text-espresso">
                    {typeLabels[booking.shoot_type] ?? booking.shoot_type}
                  </span>
                </p>
                <p className="mt-1 text-sm text-mocha">
                  {booking.email} · {booking.phone}
                </p>
                <p className="mt-1 text-sm text-mocha">
                  Tarih: {formatDate(booking.preferred_date)}
                  {booking.location && ` · Konum: ${booking.location}`}
                </p>
                {booking.notes && (
                  <p className="mt-2 text-sm text-mist">{booking.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <form
                  action={updateBookingStatus}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="id" value={booking.id} />
                  <select
                    name="status"
                    defaultValue={booking.status}
                    className="rounded-lg border border-espresso/20 bg-white/60 px-2 py-1.5 text-sm"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="text-sm text-gold-dark hover:underline"
                  >
                    Güncelle
                  </button>
                </form>
                <form action={deleteBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-700 hover:text-red-900"
                  >
                    Sil
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {(bookings ?? []).length === 0 && (
          <p className="rounded-2xl border border-espresso/10 bg-white/50 p-8 text-center text-mist">
            Henüz rezervasyon talebi yok.
          </p>
        )}
      </div>
    </div>
  );
}
