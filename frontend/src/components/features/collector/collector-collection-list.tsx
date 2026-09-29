"use client";

import { ClipboardList, Inbox } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { CollectionCard } from "@/components/domain/collection-card";
import { Button } from "@/components/ui/button";
import { useAssignedCollections, useAvailableCollections } from "@/hooks/use-collector-collections";
import type { CollectorCollection } from "@/lib/api/collections";
import { NEXT_ACTION } from "@/lib/collector-actions";
import { PAGE_PARAM, pageFromParams } from "@/lib/pagination";

const PAGE_SIZE = 10;

export type CollectorListVariant = "available" | "assigned";

const VARIANTS = {
  available: {
    path: "/coletor/disponiveis",
    useList: useAvailableCollections,
    count: (total: number) => `${total} ${total === 1 ? "coleta disponível" : "coletas disponíveis"}`,
  },
  assigned: {
    path: "/coletor/coletas",
    useList: useAssignedCollections,
    count: (total: number) => `${total} ${total === 1 ? "coleta" : "coletas"}`,
  },
} as const;

export function CollectorCollectionItems({ items }: { items: CollectorCollection[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((collection) => (
        <li key={collection.id}>
          <CollectionCard
            collection={collection}
            href={`/coletor/coletas/${collection.id}`}
            nextAction={NEXT_ACTION[collection.status]?.label}
          />
        </li>
      ))}
    </ul>
  );
}

function EmptyList({ variant }: { variant: CollectorListVariant }) {
  if (variant === "available") {
    // Ausência de coletas não é erro (10 §98).
    return (
      <EmptyState
        icon={Inbox}
        title="Nenhuma coleta disponível no momento."
        description="Novas solicitações aparecem aqui assim que forem feitas."
      />
    );
  }

  return (
    <EmptyState
      icon={ClipboardList}
      title="Você ainda não aceitou nenhuma coleta."
      description="Aceite uma coleta disponível para começar."
      action={
        <Button asChild>
          <Link href={VARIANTS.available.path}>Ver coletas disponíveis</Link>
        </Button>
      }
    />
  );
}

// Listas do coletor (11 §63 CollectorRouteList): disponíveis, das mais
// antigas para as mais recentes, e atribuídas, das mais recentes para as mais
// antigas (DEC-070). Sem agrupamentos por status enquanto OQ-047 estiver aberta.
export function CollectorCollectionList({ variant }: { variant: CollectorListVariant }) {
  const config = VARIANTS[variant];
  const searchParams = useSearchParams();
  const page = pageFromParams(searchParams.get(PAGE_PARAM));
  const query = config.useList(page, PAGE_SIZE);

  if (query.isPending) return <CollectionListSkeleton />;

  if (query.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar as coletas."
        message="Verifique sua conexão e tente novamente."
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  const { items, pagination } = query.data;

  if (pagination.total === 0) return <EmptyList variant={variant} />;

  // Página além da última (ex.: link antigo ou coletas aceitas por outros coletores).
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Esta página não existe."
        description={`A lista vai até a página ${pagination.totalPages}.`}
        action={
          <Button asChild variant="outline">
            <Link href={config.path}>Ir para a primeira página</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4" aria-busy={query.isPlaceholderData || undefined}>
      <p className="text-sm text-muted-foreground">{config.count(pagination.total)}</p>
      <CollectorCollectionItems items={items} />
      <Pagination pagination={pagination} hrefForPage={(target) => `${config.path}?${PAGE_PARAM}=${target}`} />
    </div>
  );
}
