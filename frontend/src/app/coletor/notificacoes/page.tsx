import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { NotificationCenter } from "@/components/features/notifications/notification-center";

export const metadata: Metadata = { title: "Notificações" };

export default function ColetorNotificacoesPage() {
  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Notificações</h1>
      {/* A lista lê ?pagina da URL (useSearchParams): fica sob Suspense. */}
      <Suspense fallback={<CollectionListSkeleton />}>
        <NotificationCenter path="/coletor/notificacoes" collectionsPath="/coletor/coletas" />
      </Suspense>
    </div>
  );
}
