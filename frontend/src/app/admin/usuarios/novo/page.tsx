import type { Metadata } from "next";
import { AdminCollectorForm } from "@/components/features/admin/admin-collector-form";

export const metadata: Metadata = { title: "Cadastrar coletor" };

export default function AdminNovoColetorPage() {
  return <AdminCollectorForm />;
}
