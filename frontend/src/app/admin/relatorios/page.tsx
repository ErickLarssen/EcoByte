import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/common/detail-parts";
import { AdminReports } from "@/components/features/admin/admin-reports";

export const metadata: Metadata = { title: "Relatórios" };

// Relatórios administrativos por agregação no MongoDB (RF-046, DEC-098).
export default function AdminRelatoriosPage() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Indicadores das coletas, calculados direto no banco de dados.</p>
      </div>
      {/* O período vem da URL (useSearchParams): fica sob Suspense. */}
      <Suspense fallback={<DetailSkeleton label="Gerando relatórios..." />}>
        <AdminReports />
      </Suspense>
    </div>
  );
}
