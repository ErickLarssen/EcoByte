import type { Metadata } from "next";
import { AdminEcopoint } from "@/components/features/admin/admin-ecopoint";

export const metadata: Metadata = { title: "Ecoponto" };

export default function AdminEcopontoPage() {
  return <AdminEcopoint />;
}
