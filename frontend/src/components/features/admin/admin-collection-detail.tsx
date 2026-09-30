"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { BackLink, DetailSection, DetailSkeleton } from "@/components/common/detail-parts";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { AddressCard } from "@/components/domain/address-card";
import { CollectionStatusBadge } from "@/components/domain/collection-status-badge";
import { CollectionTimeline } from "@/components/domain/collection-timeline";
import { WasteItemsList } from "@/components/domain/waste-items-list";
import { Button } from "@/components/ui/button";
import { useAdminCollection } from "@/hooks/use-admin";
import type { AdminUserRef } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { STATUS_INFO } from "@/lib/collection-status";
import { NOT_INFORMED, formatDate } from "@/lib/format";

const LIST_PATH = "/admin/coletas";

function Person({ person, empty }: { person: AdminUserRef | null; empty: string }) {
  if (!person) return <p className="text-muted-foreground">{empty}</p>;

  return (
    <div className="grid gap-0.5">
      <Link
        href={`/admin/usuarios/${person.id}`}
        className="justify-self-start font-medium text-primary underline-offset-4 hover:underline"
      >
        {person.nome}
      </Link>
      <p className="text-sm break-words text-muted-foreground">{person.email}</p>
      <p className="text-sm text-muted-foreground">Telefone: {person.telefone ?? NOT_INFORMED}</p>
    </div>
  );
}

// Detalhe administrativo da coleta (RF-045). Somente leitura: o administrador
// não altera status nem responsável (OQ-055, 13 §54).
export function AdminCollectionDetail({ id }: { id: string }) {
  const query = useAdminCollection(id);

  if (query.isPending) return <DetailSkeleton />;

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <div className="grid gap-4">
          <BackLink href={LIST_PATH}>Coletas</BackLink>
          <EmptyState
            icon={SearchX}
            title="Coleta não encontrada."
            description="Confira o endereço ou volte para a lista."
            action={
              <Button asChild variant="outline">
                <Link href={LIST_PATH}>Ver coletas</Link>
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <BackLink href={LIST_PATH}>Coletas</BackLink>
        <ErrorState
          title="Não foi possível carregar a coleta."
          message="Verifique sua conexão e tente novamente."
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      </div>
    );
  }

  const collection = query.data;

  return (
    <div className="grid gap-5">
      <BackLink href={LIST_PATH}>Coletas</BackLink>

      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Coleta</h1>
          <CollectionStatusBadge status={collection.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Solicitada em <time dateTime={collection.createdAt}>{formatDate(collection.createdAt)}</time> ·{" "}
          {STATUS_INFO[collection.status].description}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <DetailSection title="Cliente">
              <Person person={collection.cliente} empty={NOT_INFORMED} />
            </DetailSection>
            <DetailSection title="Coletor responsável">
              <Person person={collection.coletor} empty="Aguardando um coletor aceitar a coleta." />
            </DetailSection>
          </div>

          <DetailSection title="Endereço da coleta">
            <AddressCard address={collection.enderecoColeta} />
          </DetailSection>

          <DetailSection title="Itens">
            <WasteItemsList items={collection.itensDescarte} />
          </DetailSection>

          <DetailSection title="Observações">
            <p className={collection.observacoes ? "break-words" : "text-muted-foreground"}>
              {collection.observacoes ?? NOT_INFORMED}
            </p>
          </DetailSection>
        </div>

        <DetailSection title="Andamento">
          <CollectionTimeline collection={collection} />
        </DetailSection>
      </div>
    </div>
  );
}
