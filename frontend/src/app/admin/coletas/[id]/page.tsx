import type { Metadata } from "next";
import { AdminCollectionDetail } from "@/components/features/admin/admin-collection-detail";

export const metadata: Metadata = { title: "Detalhes da coleta" };

// Next.js 16: params é uma Promise.
export default async function AdminColetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCollectionDetail id={id} />;
}
