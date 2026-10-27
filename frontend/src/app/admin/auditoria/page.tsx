import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { AdminAuditLog } from "@/components/features/admin/admin-audit-log";

export const metadata: Metadata = { title: "Auditoria" };

// Registro das ações administrativas e sensíveis (DEC-094).
export default function AdminAuditoriaPage() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Auditoria</h1>
        <p className="text-muted-foreground">
          Ações sensíveis feitas no sistema, com quem as fez e quando. Os registros não podem ser alterados.
        </p>
      </div>
      {/* A lista lê ?pagina da URL (useSearchParams): fica sob Suspense. */}
      <Suspense fallback={<CollectionListSkeleton />}>
        <AdminAuditLog />
      </Suspense>
    </div>
  );
}
