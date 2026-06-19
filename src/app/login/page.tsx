import { AuthForm } from "@/components/AuthForm";
import { getPrefsFromCookies } from "@/server/actions/prefs";

export default async function LoginPage() {
  const { lang } = await getPrefsFromCookies();
  return <AuthForm mode="login" lang={lang} />;
}
