"use client";

import { CheckCircle2, SearchX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BackLink as BackLinkTo, DetailSection as Section, DetailSkeleton } from "@/components/common/detail-parts";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { AddressCard } from "@/components/domain/address-card";
import { CollectionStatusBadge } from "@/components/domain/collection-status-badge";
import { CollectionTimeline } from "@/components/domain/collection-timeline";
import { WasteItemsList } from "@/components/domain/waste-items-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useMyCollection } from "@/hooks/use-client-collections";
import { ApiError } from "@/lib/api/client";
import { STATUS_INFO } from "@/lib/collection-status";
import { NOT_INFORMED, formatDate } from "@/lib/format";

function BackLink() {
  return <BackLinkTo href="/cliente/coletas">Minhas coletas</BackLinkTo>;
}

// Detalhe da coleta para o cliente (RF-022, 11 §54): status, andamento,
// endereço, itens, observações e coletor responsável.
export function ClientCollectionDetail({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("nova") === "1";
  const query = useMyCollection(id);

  if (query.isPending) return <DetailSkeleton />;

  if (query.isError) {
    // 404 inclui coleta de outro cliente, sem revelar que existe (DEC-070).
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <div className="grid gap-4">
          <BackLink />
          <EmptyState
            icon={SearchX}
            title="Coleta não encontrada."
            description="Ela pode ter sido removida ou o endereço está incorreto."
            action={
              <Button asChild variant="outline">
                <Link href="/cliente/coletas">Ver minhas coletas</Link>
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <BackLink />
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
      <BackLink />

      {justCreated && (
        <Alert className="border-success/30 bg-success-surface text-success">
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>Coleta solicitada com sucesso.</AlertTitle>
          <AlertDescription className="text-success">
            Ela está aguardando um coletor. Você acompanha cada etapa por aqui.
          </AlertDescription>
        </Alert>
      )}

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
        {/* Primeiro no celular (acompanhar o status é o objetivo da tela); coluna lateral no desktop. */}
        <div className="lg:col-start-2 lg:row-start-1">
          <Section title="Andamento">
            <CollectionTimeline collection={collection} />
          </Section>
        </div>

        <div className="grid gap-5 lg:col-start-1 lg:row-start-1">
          <Section title="Endereço da coleta">
            <AddressCard address={collection.enderecoColeta} />
          </Section>

          <Section title="Itens">
            <WasteItemsList items={collection.itensDescarte} />
          </Section>

          <Section title="Observações">
            <p className={collection.observacoes ? "break-words" : "text-muted-foreground"}>
              {collection.observacoes ?? NOT_INFORMED}
            </p>
          </Section>

          <Section title="Coletor responsável">
            <p className={collection.coletor ? "" : "text-muted-foreground"}>
              {collection.coletor?.nome ?? "Aguardando um coletor aceitar a coleta."}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
