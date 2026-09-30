import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { AdminUserList } from "@/components/features/admin/admin-user-list";

export const metadata: Metadata = { title: "Usuários" };

export default function AdminUsuariosPage() {
  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
      {/* A lista lê ?pagina da URL (useSearchParams): fica sob Suspense. */}
      <Suspense fallback={<CollectionListSkeleton />}>
        <AdminUserList />
      </Suspense>
    </div>
  );
}
