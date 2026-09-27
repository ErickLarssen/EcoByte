import type { Metadata } from "next";
import { ClientDashboard } from "@/components/features/collections/client-dashboard";

export const metadata: Metadata = { title: "Painel do cliente" };

export default function ClienteHomePage() {
  return <ClientDashboard />;
}
