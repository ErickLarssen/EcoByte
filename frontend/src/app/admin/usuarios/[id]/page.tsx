import type { Metadata } from "next";
import { AdminUserDetail } from "@/components/features/admin/admin-user-detail";

export const metadata: Metadata = { title: "Detalhes do usuário" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Next.js 16: params e searchParams são Promises. ?novo=1 vem do cadastro de coletor (DEC-083).
export default async function AdminUsuarioPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { novo } = await searchParams;
  return <AdminUserDetail id={id} justCreated={novo === "1"} />;
}
