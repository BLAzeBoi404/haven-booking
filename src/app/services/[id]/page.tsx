import { notFound } from "next/navigation";
import { getServiceDetail, getCurrentUser } from "@/server/queries";
import { ServiceDetailClient } from "@/components/ServiceDetailClient";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detail, user] = await Promise.all([getServiceDetail(id), getCurrentUser()]);
  if (!detail) notFound();

  const { provider, reviews } = detail;
  return <ServiceDetailClient service={detail} provider={provider} reviews={reviews} user={user} />;
}
