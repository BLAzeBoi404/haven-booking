import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PrefsProvider } from "@/components/PrefsProvider";
import { getPrefsFromCookies } from "@/server/actions/prefs";
import { getCurrentUser } from "@/server/queries";

export const metadata: Metadata = {
  title: "HAVEN — бронювання послуг",
  description: "Перевірені спеціалісти. Клінінг, ремонт, IT, дизайн та ще 10 категорій.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ lang, currency }, user] = await Promise.all([getPrefsFromCookies(), getCurrentUser()]);

  return (
    <html lang={lang}>
      <body>
        <PrefsProvider lang={lang} currency={currency}>
          <Header user={user} />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ScrollToTop />
        </PrefsProvider>
      </body>
    </html>
  );
}
