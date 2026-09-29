"use client";

import { ClipboardList, Inbox, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useAuth } from "@/components/features/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignedCollections, useAvailableCollections } from "@/hooks/use-collector-collections";
import { CollectorCollectionItems } from "./collector-collection-list";

const PREVIEW_LIMIT = 3;

type ListQuery = ReturnType<typeof useAvailableCollections>;

// Total vindo da API (13 §43); o próprio cartão leva à lista correspondente.
function CountTile({ href, label, icon: Icon, query }: { href: string; label: string; icon: LucideIcon; query: ListQuery }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="grid">
        <span className="text-sm text-muted-foreground">{label}</span>
        {query.data ? (
          <span className="text-2xl font-semibold tabular-nums">{query.data.pagination.total}</span>
        ) : query.isError ? (
          <span className="text-sm text-muted-foreground">Indisponível</span>
        ) : (
          <>
            <span className="sr-only">Carregando...</span>
            <Skeleton className="mt-1 h-7 w-10" aria-hidden="true" />
          </>
        )}
      </span>
    </Link>
  );
}

function PreviewSection({
  id,
  title,
  href,
  query,
  empty,
}: {
  id: string;
  title: string;
  href: string;
  query: ListQuery;
  empty: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id={id} className="text-lg font-semibold">
          {title}
        </h2>
        {query.data && query.data.pagination.total > PREVIEW_LIMIT && (
          <Link href={href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Ver todas
          </Link>
        )}
      </div>

      {query.isPending && <CollectionListSkeleton count={PREVIEW_LIMIT} />}

      {query.isError && (
        <ErrorState
          title="Não foi possível carregar as coletas."
          message="Verifique sua conexão e tente novamente."
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      )}

      {query.data && query.data.items.length === 0 && empty}
      {query.data && query.data.items.length > 0 && <CollectorCollectionItems items={query.data.items} />}
    </section>
  );
}

// Painel do coletor (11 §79, 13 §6, §43): quantas coletas estão disponíveis e
// atribuídas, e a próxima ação de cada coleta atribuída. Sem "próxima coleta"
// ordenada por prioridade: o critério não está definido (13 §84, OQ-047).
export function CollectorDashboard() {
  const { user } = useAuth();
  const firstName = user?.nome.split(" ")[0];
  const assigned = useAssignedCollections(1, PREVIEW_LIMIT);
  const available = useAvailableCollections(1, PREVIEW_LIMIT);

  return (
    <div className="grid gap-8">
      <section aria-labelledby="boas-vindas" className="grid gap-4">
        <h1 id="boas-vindas" className="text-2xl font-semibold tracking-tight">
          Olá{firstName ? `, ${firstName}` : ""}!
        </h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <CountTile href="/coletor/disponiveis" label="Coletas disponíveis" icon={Inbox} query={available} />
          <CountTile href="/coletor/coletas" label="Atribuídas a você" icon={ClipboardList} query={assigned} />
        </div>
      </section>

      <PreviewSection
        id="minhas-coletas"
        title="Suas coletas recentes"
        href="/coletor/coletas"
        query={assigned}
        empty={
          <EmptyState
            icon={ClipboardList}
            title="Você ainda não aceitou nenhuma coleta."
            description="Aceite uma coleta disponível para começar."
          />
        }
      />

      <PreviewSection
        id="disponiveis"
        title="Coletas disponíveis"
        href="/coletor/disponiveis"
        query={available}
        empty={<EmptyState icon={Inbox} title="Nenhuma coleta disponível no momento." />}
      />
    </div>
  );
}
