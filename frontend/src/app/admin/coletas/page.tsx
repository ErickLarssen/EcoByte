import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { AdminCollectionList } from "@/components/features/admin/admin-collection-list";

export const metadata: Metadata = { title: "Coletas" };

export default function AdminColetasPage() {
  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Coletas</h1>
      {/* A lista lê ?status e ?pagina da URL (useSearchParams): fica sob Suspense. */}
      <Suspense fallback={<CollectionListSkeleton />}>
        <AdminCollectionList />
      </Suspense>
    </div>
  );
}
