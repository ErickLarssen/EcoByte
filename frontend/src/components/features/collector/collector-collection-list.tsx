"use client";

import { ClipboardList, Inbox } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { CollectionCard } from "@/components/domain/collection-card";
import { Button } from "@/components/ui/button";
import { useAssignedCollections, useAvailableCollections } from "@/hooks/use-collector-collections";
import type { AssignedGroup, CollectorCollection } from "@/lib/api/collections";
import { NEXT_ACTION } from "@/lib/collector-actions";
import { cn } from "@/lib/utils";
import { PAGE_PARAM, pageFromParams } from "@/lib/pagination";

const PAGE_SIZE = 10;

export type CollectorListVariant = "available" | "assigned";

const AVAILABLE_PATH = "/coletor/disponiveis";
const ASSIGNED_PATH = "/coletor/coletas";
export const GROUP_PARAM = "grupo";

// Grupos de "Minhas coletas" (DEC-084), derivados dos status oficiais (13 §39).
const GROUPS: Array<{ value: AssignedGroup; label: string; empty: string }> = [
  { value: "andamento", label: "Em andamento", empty: "Nenhuma coleta em andamento." },
  { value: "concluidas", label: "Concluídas", empty: "Nenhuma coleta concluída ainda." },
];

function groupFromParams(value: string | null): AssignedGroup {
  return value === "concluidas" ? "concluidas" : "andamento";
}

const assignedHref = (group: AssignedGroup, page = 1) => {
  const params = new URLSearchParams({ [GROUP_PARAM]: group });
  if (page > 1) params.set(PAGE_PARAM, String(page));
  return `${ASSIGNED_PATH}?${params.toString()}`;
};

export function CollectorCollectionItems({ items }: { items: CollectorCollection[] }) {
  return (
    <ul className="grid gap-3" aria-label="Coletas">
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

type ListQuery = ReturnType<typeof useAvailableCollections>;

type ResultsProps = {
  query: ListQuery;
  count: (total: number) => string;
  empty: ReactNode;
  firstPageHref: string;
  hrefForPage: (page: number) => string;
};

function Results({ query, count, empty, firstPageHref, hrefForPage }: ResultsProps) {
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

  if (pagination.total === 0) return empty;

  // Página além da última (ex.: link antigo ou coletas aceitas por outros coletores).
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Esta página não existe."
        description={`A lista vai até a página ${pagination.totalPages}.`}
        action={
          <Button asChild variant="outline">
            <Link href={firstPageHref}>Ir para a primeira página</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4" aria-busy={query.isPlaceholderData || undefined}>
      <p className="text-sm text-muted-foreground">{count(pagination.total)}</p>
      <CollectorCollectionItems items={items} />
      <Pagination pagination={pagination} hrefForPage={hrefForPage} />
    </div>
  );
}

// Coletas disponíveis (11 §63 CollectorRouteList), das mais antigas para as
// mais recentes (DEC-070).
function AvailableList({ page }: { page: number }) {
  const query = useAvailableCollections(page, PAGE_SIZE);

  return (
    <Results
      query={query}
      count={(total) => `${total} ${total === 1 ? "coleta disponível" : "coletas disponíveis"}`}
      // Ausência de coletas não é erro (10 §98).
      empty={
        <EmptyState
          icon={Inbox}
          title="Nenhuma coleta disponível no momento."
          description="Novas solicitações aparecem aqui assim que forem feitas."
        />
      }
      firstPageHref={AVAILABLE_PATH}
      hrefForPage={(target) => `${AVAILABLE_PATH}?${PAGE_PARAM}=${target}`}
    />
  );
}

// Minhas coletas, separadas em "Em andamento" e "Concluídas" (DEC-084), das
// mais recentes para as mais antigas. O grupo fica na URL (?grupo=).
function AssignedList({ page, group }: { page: number; group: AssignedGroup }) {
  const query = useAssignedCollections(page, PAGE_SIZE, group);
  const current = GROUPS.find((item) => item.value === group)!;

  return (
    <div className="grid gap-4">
      <nav aria-label="Grupos de coletas">
        <ul className="flex flex-wrap gap-2">
          {GROUPS.map((item) => {
            const active = item.value === group;
            return (
              <li key={item.value}>
                <Link
                  href={assignedHref(item.value)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 md:h-9",
                    active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Results
        query={query}
        count={(total) => `${total} ${total === 1 ? "coleta" : "coletas"}`}
        empty={
          group === "andamento" ? (
            <EmptyState
              icon={ClipboardList}
              title={current.empty}
              description="Aceite uma coleta disponível para começar."
              action={
                <Button asChild>
                  <Link href={AVAILABLE_PATH}>Ver coletas disponíveis</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState icon={ClipboardList} title={current.empty} />
          )
        }
        firstPageHref={assignedHref(group)}
        hrefForPage={(target) => assignedHref(group, target)}
      />
    </div>
  );
}

export function CollectorCollectionList({ variant }: { variant: CollectorListVariant }) {
  const searchParams = useSearchParams();
  const page = pageFromParams(searchParams.get(PAGE_PARAM));

  return variant === "available" ? (
    <AvailableList page={page} />
  ) : (
    <AssignedList page={page} group={groupFromParams(searchParams.get(GROUP_PARAM))} />
  );
}
