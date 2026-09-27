"use client";

import { ClipboardList, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { CollectionCard } from "@/components/domain/collection-card";
import { Button } from "@/components/ui/button";
import { useMyCollections } from "@/hooks/use-client-collections";

const PAGE_SIZE = 10;
const PAGE_PARAM = "pagina";

function pageFromParams(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

// Minhas coletas (RF-021): lista paginada, mais recentes primeiro (DEC-070).
// A página fica na URL (?pagina=2), permitindo voltar e compartilhar o link.
export function ClientCollectionList() {
  const searchParams = useSearchParams();
  const page = pageFromParams(searchParams.get(PAGE_PARAM));
  const query = useMyCollections(page, PAGE_SIZE);

  if (query.isPending) return <CollectionListSkeleton />;

  if (query.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar suas coletas."
        message="Verifique sua conexão e tente novamente."
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  const { items, pagination } = query.data;

  if (pagination.total === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhuma coleta encontrada."
        description="Solicite sua primeira coleta de lixo eletrônico."
        action={
          <Button asChild>
            <Link href="/cliente/coletas/nova">
              <PlusCircle aria-hidden="true" data-icon="inline-start" />
              Solicitar coleta
            </Link>
          </Button>
        }
      />
    );
  }

  // Página além da última (ex.: link antigo ou ?pagina digitado).
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Esta página não existe."
        description={`Suas coletas vão até a página ${pagination.totalPages}.`}
        action={
          <Button asChild variant="outline">
            <Link href="/cliente/coletas">Ir para a primeira página</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        {pagination.total} {pagination.total === 1 ? "coleta" : "coletas"}
      </p>
      <ul className="grid gap-3" aria-busy={query.isPlaceholderData || undefined}>
        {items.map((collection) => (
          <li key={collection.id}>
            <CollectionCard collection={collection} href={`/cliente/coletas/${collection.id}`} />
          </li>
        ))}
      </ul>
      <Pagination pagination={pagination} hrefForPage={(target) => `/cliente/coletas?${PAGE_PARAM}=${target}`} />
    </div>
  );
}
