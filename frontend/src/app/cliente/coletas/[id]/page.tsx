import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/common/page-loader";
import { ClientCollectionDetail } from "@/components/features/collections/client-collection-detail";

export const metadata: Metadata = { title: "Detalhes da coleta" };

// Next.js 16: params é uma Promise.
export default async function DetalheColetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={<PageLoader label="Carregando coleta..." />}>
      <ClientCollectionDetail id={id} />
    </Suspense>
  );
}
