import type { Metadata } from "next";
import { DashboardWelcome } from "@/components/features/dashboard/dashboard-welcome";

export const metadata: Metadata = { title: "Painel do cliente" };

export default function ClienteHomePage() {
  return <DashboardWelcome description="Em breve você poderá solicitar e acompanhar suas coletas por aqui." />;
}
