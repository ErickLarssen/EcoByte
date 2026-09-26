import type { Metadata } from "next";
import { DashboardWelcome } from "@/components/features/dashboard/dashboard-welcome";

export const metadata: Metadata = { title: "Painel do coletor" };

export default function ColetorHomePage() {
  return <DashboardWelcome description="Em breve você verá aqui as coletas disponíveis e as suas rotas." />;
}
