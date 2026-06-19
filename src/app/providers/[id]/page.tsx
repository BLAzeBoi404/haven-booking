// =====================================================================
//  Сторінка профілю фахівця.
// =====================================================================

import { notFound } from "next/navigation";
import { getProviderProfile, getCurrentUser } from "@/server/queries";
import { ProviderProfileClient } from "@/components/ProviderProfileClient";

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [provider, user] = await Promise.all([getProviderProfile(id), getCurrentUser()]);
  if (!provider || provider.role !== "PROVIDER") notFound();

  return <ProviderProfileClient provider={provider} services={provider.services} user={user} />;
}
