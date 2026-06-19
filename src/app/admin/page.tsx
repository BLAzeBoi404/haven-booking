import { getAdminStats } from "@/server/actions/admin";
import { getAllBookings, getAllProviders, getAllUsers, getAllServices } from "@/server/queries";
import { getPrefsFromCookies } from "@/server/actions/prefs";
import { AdminPanel } from "@/components/AdminPanel";

export default async function AdminPage() {
  const [{ lang, currency }, stats, bookings, providers, users, services] = await Promise.all([
    getPrefsFromCookies(),
    getAdminStats(),
    getAllBookings(),
    getAllProviders(),
    getAllUsers(),
    getAllServices(),
  ]);

  return (
    <div className="pt-20 pb-16 fade-in max-w-6xl mx-auto px-4">
      <AdminPanel stats={stats} bookings={bookings} providers={providers} users={users} services={services} lang={lang} currency={currency} />
    </div>
  );
}
