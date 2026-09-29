"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, SearchX, UserCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BackLink, DetailSection, DetailSkeleton } from "@/components/common/detail-parts";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { AddressCard } from "@/components/domain/address-card";
import { CollectionActions } from "@/components/domain/collection-actions";
import { CollectionStatusBadge } from "@/components/domain/collection-status-badge";
import { CollectionTimeline } from "@/components/domain/collection-timeline";
import { WasteItemsList } from "@/components/domain/waste-items-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { collectorCollectionKeys, useCollectorCollection, useCollectorEvent } from "@/hooks/use-collector-collections";
import type { CollectorEvent } from "@/lib/api/collections";
import { ApiError } from "@/lib/api/client";
import { describeActionFailure, type ActionFailure } from "@/lib/collector-actions";
import { NOT_INFORMED, formatDate } from "@/lib/format";

type Feedback = { kind: "success"; message: string } | { kind: "failure"; failure: ActionFailure };

const AVAILABLE_PATH = "/coletor/disponiveis";
const ASSIGNED_PATH = "/coletor/coletas";

// Detalhe e ações da coleta para o coletor (13 §11, §20–§31, DEC-072).
// A coleta PENDENTE pode ser consultada antes do aceite; depois, só pelo
// coletor responsável (DEC-070). O status exibido é sempre o da API (13 §76).
export function CollectorCollectionDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useCollectorCollection(id);
  const mutation = useCollectorEvent(id);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // O botão some ao concluir ou em caso de recusa: o foco vai para o feedback (13 §80–§81).
  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  function handleAction(event: CollectorEvent) {
    setFeedback(null);
    mutation.mutate(event, {
      onSuccess: ({ message }) => setFeedback({ kind: "success", message }),
      onError: (error) => {
        const failure = describeActionFailure(event, error);
        setFeedback({ kind: "failure", failure });
        if (failure.resync) void queryClient.invalidateQueries({ queryKey: collectorCollectionKeys.detail(id) });
      },
    });
  }

  if (query.isPending) return <DetailSkeleton />;

  if (query.isError) {
    // 404 inclui coleta já aceita por outro coletor, sem revelar a quem pertence (DEC-070, 13 §61–§62).
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <div className="grid gap-4">
          <BackLink href={AVAILABLE_PATH}>Coletas disponíveis</BackLink>
          <EmptyState
            icon={SearchX}
            title="Coleta não encontrada."
            description="Ela pode ter sido aceita por outro coletor ou o endereço está incorreto."
            action={
              <Button asChild variant="outline">
                <Link href={AVAILABLE_PATH}>Ver coletas disponíveis</Link>
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <BackLink href={ASSIGNED_PATH}>Minhas coletas</BackLink>
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
  const isAvailable = collection.status === "PENDENTE";
  const unavailable = feedback?.kind === "failure" && feedback.failure.unavailable;

  return (
    <div className="grid gap-5">
      {isAvailable ? (
        <BackLink href={AVAILABLE_PATH}>Coletas disponíveis</BackLink>
      ) : (
        <BackLink href={ASSIGNED_PATH}>Minhas coletas</BackLink>
      )}

      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Coleta</h1>
          <CollectionStatusBadge status={collection.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Solicitada em <time dateTime={collection.createdAt}>{formatDate(collection.createdAt)}</time>
        </p>
        {!isAvailable && (
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <UserCheck className="size-4 text-primary" aria-hidden="true" />
            Você é o coletor responsável.
          </p>
        )}
      </header>

      {/* Feedback textual das ações (13 §58–§59, §80). */}
      <div ref={feedbackRef} tabIndex={-1} className="outline-none empty:hidden">
        {feedback?.kind === "success" && (
          <Alert role="status" className="border-success/30 bg-success-surface text-success">
            <CheckCircle2 aria-hidden="true" />
            <AlertTitle>{feedback.message}</AlertTitle>
          </Alert>
        )}
        {feedback?.kind === "failure" && (
          <Alert variant="destructive" className="border-destructive/30">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>{feedback.failure.title}</AlertTitle>
            <AlertDescription>{feedback.failure.description}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Ação principal em destaque, antes dos detalhes (13 §64). */}
      {unavailable ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={AVAILABLE_PATH}>Ver coletas disponíveis</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href={ASSIGNED_PATH}>Minhas coletas</Link>
          </Button>
        </div>
      ) : collection.status === "CONCLUIDA" ? (
        <p className="text-sm text-muted-foreground">Operação encerrada. Não há mais ações para esta coleta.</p>
      ) : (
        <CollectionActions status={collection.status} pending={mutation.isPending} onAction={handleAction} />
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="grid gap-5">
          <DetailSection title="Endereço da coleta">
            <AddressCard address={collection.enderecoColeta} />
          </DetailSection>

          {/* Dados do cliente só nas coletas atribuídas ao coletor (DEC-070, 13 §21). */}
          {!isAvailable && (
            <DetailSection title="Cliente">
              {collection.cliente ? (
                <div className="grid gap-0.5">
                  <p className="font-medium">{collection.cliente.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    Telefone: {collection.cliente.telefone ?? NOT_INFORMED}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">{NOT_INFORMED}</p>
              )}
            </DetailSection>
          )}

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
