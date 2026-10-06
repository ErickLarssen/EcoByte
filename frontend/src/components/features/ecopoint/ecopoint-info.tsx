"use client";

import { MapPinOff } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { EcopointCard } from "@/components/domain/ecopoint-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEcopoint } from "@/hooks/use-ecopoint";
import { ApiError } from "@/lib/api/client";

// Informações do ecoponto central (RF-036), para qualquer visitante (DEC-076).
export function EcopointInfo() {
  const query = useEcopoint();

  if (query.isPending) {
    return (
      <div role="status" aria-live="polite" className="grid gap-3 surface-card p-5">
        <span className="sr-only">Carregando ecoponto...</span>
        <Skeleton className="h-6 w-1/2" aria-hidden="true" />
        <Skeleton className="h-4 w-3/4" aria-hidden="true" />
        <Skeleton className="h-4 w-2/3" aria-hidden="true" />
      </div>
    );
  }

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return <EmptyState icon={MapPinOff} title="As informações do ecoponto ainda não foram cadastradas." />;
    }

    return (
      <ErrorState
        title="Não foi possível carregar o ecoponto."
        message="Verifique sua conexão e tente novamente."
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  return <EcopointCard ecopoint={query.data} />;
}
