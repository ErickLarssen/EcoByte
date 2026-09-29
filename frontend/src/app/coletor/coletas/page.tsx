import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { CollectorCollectionList } from "@/components/features/collector/collector-collection-list";

export const metadata: Metadata = { title: "Minhas coletas" };

export default function ColetorMinhasColetasPage() {
  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Minhas coletas</h1>
      {/* A lista lê ?pagina da URL (useSearchParams): fica sob Suspense. */}
      <Suspense fallback={<CollectionListSkeleton />}>
        <CollectorCollectionList variant="assigned" />
      </Suspense>
    </div>
  );
}
