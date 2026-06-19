import { getServicesWithProviders } from "@/server/queries";
import { ServiceCatalog } from "@/components/ServiceCatalog";

export default async function HomePage() {
  const services = await getServicesWithProviders();
  return <ServiceCatalog services={services} />;
}
