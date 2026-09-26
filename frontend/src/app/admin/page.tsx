import type { Metadata } from "next";
import { DashboardWelcome } from "@/components/features/dashboard/dashboard-welcome";

export const metadata: Metadata = { title: "Painel administrativo" };

export default function AdminHomePage() {
  return <DashboardWelcome description="Em breve você poderá acompanhar usuários, coletas e o ecoponto por aqui." />;
}
