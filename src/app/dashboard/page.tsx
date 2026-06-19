import { redirect } from "next/navigation";
import { getCurrentUser, getProviderProfile } from "@/server/queries";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "PROVIDER") redirect("/");

  const provider = await getProviderProfile(user.id);
  if (!provider) redirect("/");

  redirect(`/providers/${user.id}`);
}
