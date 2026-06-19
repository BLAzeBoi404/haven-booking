import { getMyBookings } from "@/server/actions/bookings";
import { getPrefsFromCookies } from "@/server/actions/prefs";
import { BookingsList } from "@/components/BookingsList";

export default async function BookingsPage() {
  const [{ lang, currency }, bookings] = await Promise.all([getPrefsFromCookies(), getMyBookings()]);
  return (
    <div className="pt-20 pb-16 fade-in max-w-3xl mx-auto px-4">
      <BookingsList bookings={bookings} lang={lang} currency={currency} />
    </div>
  );
}
