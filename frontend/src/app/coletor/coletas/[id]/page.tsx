import type { Metadata } from "next";
import { CollectorCollectionDetail } from "@/components/features/collector/collector-collection-detail";

export const metadata: Metadata = { title: "Detalhes da coleta" };

// Next.js 16: params é uma Promise.
export default async function ColetorDetalheColetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CollectorCollectionDetail id={id} />;
}
