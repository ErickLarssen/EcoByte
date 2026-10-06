"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { CollectionCard } from "@/components/domain/collection-card";
import { CollectionStatusBadge } from "@/components/domain/collection-status-badge";
import { Button } from "@/components/ui/button";
import { useAdminCollections } from "@/hooks/use-admin";
import type { AdminCollection } from "@/lib/api/admin";
import { COLLECTION_STATUSES, STATUS_INFO, type CollectionStatus } from "@/lib/collection-status";
import { formatDate, formatStreetLine } from "@/lib/format";
import { PAGE_PARAM, pageFromParams } from "@/lib/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const LIST_PATH = "/admin/coletas";
export const STATUS_PARAM = "status";

function statusFromParams(value: string | null): CollectionStatus | null {
  return (COLLECTION_STATUSES as readonly string[]).includes(value ?? "") ? (value as CollectionStatus) : null;
}

// Trocar o filtro volta para a primeira página.
function listHref(status: CollectionStatus | null, page = 1): string {
  const params = new URLSearchParams();
  if (status) params.set(STATUS_PARAM, status);
  if (page > 1) params.set(PAGE_PARAM, String(page));
  const search = params.toString();
  return search ? `${LIST_PATH}?${search}` : LIST_PATH;
}

const collectionHref = (collection: AdminCollection) => `${LIST_PATH}/${collection.id}`;

// Filtro por status (DEC-075): links reais, com o filtro ativo em aria-current.
function StatusFilter({ current }: { current: CollectionStatus | null }) {
  const options: Array<{ status: CollectionStatus | null; label: string }> = [
    { status: null, label: "Todas" },
    ...COLLECTION_STATUSES.map((status) => ({ status, label: STATUS_INFO[status].label })),
  ];

  return (
    <nav aria-label="Filtrar por status">
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.status === current;
          return (
            <li key={option.label}>
              <Link
                href={listHref(option.status)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 md:h-9",
                  active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40",
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CollectionTable({ collections }: { collections: AdminCollection[] }) {
  return (
    <div className="hidden overflow-hidden surface-card md:block">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Coletas</caption>
        <thead className="border-b bg-muted/50 text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Endereço</th>
            <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
            <th scope="col" className="px-4 py-3 font-medium">Coletor</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Solicitada em</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {collections.map((collection) => (
            <tr key={collection.id} className="hover:bg-muted/40">
              <th scope="row" className="max-w-64 px-4 py-3 font-normal">
                <Link
                  href={collectionHref(collection)}
                  className="block truncate font-medium text-primary underline-offset-4 hover:underline"
                >
                  {formatStreetLine(collection.enderecoColeta)}
                </Link>
                <span className="block truncate text-muted-foreground">{collection.enderecoColeta.bairro}</span>
              </th>
              <td className="max-w-48 truncate px-4 py-3">{collection.cliente?.nome ?? "—"}</td>
              <td className={cn("max-w-48 truncate px-4 py-3", !collection.coletor && "text-muted-foreground")}>
                {collection.coletor?.nome ?? "Sem coletor"}
              </td>
              <td className="px-4 py-3">
                <CollectionStatusBadge status={collection.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                <time dateTime={collection.createdAt}>{formatDate(collection.createdAt)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Results({ status, page }: { status: CollectionStatus | null; page: number }) {
  const query = useAdminCollections(page, status, PAGE_SIZE);

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

  if (items.length === 0) {
    const beyondLastPage = pagination.total > 0;
    return (
      <EmptyState
        icon={ClipboardList}
        title={beyondLastPage ? "Esta página não existe." : "Nenhum registro encontrado."}
        description={
          beyondLastPage
            ? `A lista vai até a página ${pagination.totalPages}.`
            : status
              ? `Nenhuma coleta com o status "${STATUS_INFO[status].label}".`
              : undefined
        }
        action={
          beyondLastPage ? (
            <Button asChild variant="outline">
              <Link href={listHref(status)}>Ir para a primeira página</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4" aria-busy={query.isPlaceholderData || undefined}>
      <p className="text-sm text-muted-foreground">
        {pagination.total} {pagination.total === 1 ? "coleta" : "coletas"}
      </p>
      <ul className="grid gap-3 md:hidden">
        {items.map((collection) => (
          <li key={collection.id}>
            <CollectionCard collection={collection} href={collectionHref(collection)} />
          </li>
        ))}
      </ul>
      <CollectionTable collections={items} />
      <Pagination pagination={pagination} hrefForPage={(target) => listHref(status, target)} />
    </div>
  );
}

// Coletas do sistema (RF-044, 11 §81), somente leitura (OQ-055).
export function AdminCollectionList() {
  const searchParams = useSearchParams();
  const status = statusFromParams(searchParams.get(STATUS_PARAM));
  const page = pageFromParams(searchParams.get(PAGE_PARAM));

  return (
    <div className="grid gap-4">
      <StatusFilter current={status} />
      <Results status={status} page={page} />
    </div>
  );
}
