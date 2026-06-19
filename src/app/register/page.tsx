import { AuthForm } from "@/components/AuthForm";
import { getPrefsFromCookies } from "@/server/actions/prefs";

export default async function RegisterPage() {
  const { lang } = await getPrefsFromCookies();
  return <AuthForm mode="register" lang={lang} />;
}
