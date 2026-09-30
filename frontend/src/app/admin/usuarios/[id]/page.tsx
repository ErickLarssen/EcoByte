import type { Metadata } from "next";
import { AdminUserDetail } from "@/components/features/admin/admin-user-detail";

export const metadata: Metadata = { title: "Detalhes do usuário" };

// Next.js 16: params é uma Promise.
export default async function AdminUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminUserDetail id={id} />;
}
