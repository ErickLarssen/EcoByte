"use client";

import { ClipboardList, Inbox } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { CountTile } from "@/components/common/count-tile";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useAuth } from "@/components/features/auth/auth-provider";
import { useAssignedCollections, useAvailableCollections } from "@/hooks/use-collector-collections";
import { CollectorCollectionItems } from "./collector-collection-list";

const PREVIEW_LIMIT = 3;

type ListQuery = ReturnType<typeof useAvailableCollections>;

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
          <CountTile
            href="/coletor/disponiveis"
            label="Coletas disponíveis"
            icon={Inbox}
            value={available.data?.pagination.total}
            failed={available.isError}
          />
          <CountTile
            href="/coletor/coletas"
            label="Atribuídas a você"
            icon={ClipboardList}
            value={assigned.data?.pagination.total}
            failed={assigned.isError}
          />
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
