import type { Metadata } from "next";
import { AdminDashboard } from "@/components/features/admin/admin-dashboard";

export const metadata: Metadata = { title: "Painel administrativo" };

export default function AdminHomePage() {
  return <AdminDashboard />;
}
