"use client";

import { ClipboardList, PlusCircle } from "lucide-react";
import Link from "next/link";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useAuth } from "@/components/features/auth/auth-provider";
import { CollectionCard } from "@/components/domain/collection-card";
import { Button } from "@/components/ui/button";
import { useMyCollections } from "@/hooks/use-client-collections";

const RECENT_LIMIT = 3;

// Painel do cliente (11 §78, 10 §65): solicitar coleta em destaque e as coletas
// mais recentes com o status atual. Notificações entram com a fase correspondente.
export function ClientDashboard() {
  const { user } = useAuth();
  const firstName = user?.nome.split(" ")[0];
  const recent = useMyCollections(1, RECENT_LIMIT);

  return (
    <div className="grid gap-8">
      <section aria-labelledby="boas-vindas" className="grid gap-4">
        <h1 id="boas-vindas" className="text-2xl font-semibold tracking-tight">
          Olá{firstName ? `, ${firstName}` : ""}!
        </h1>

        <div className="grid gap-4 rounded-xl bg-primary p-5 text-primary-foreground sm:flex sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-lg font-semibold">Tem lixo eletrônico para descartar?</p>
            <p className="text-sm text-primary-foreground/85">
              Informe o endereço e os itens. A equipe EcoByte recolhe e leva ao ecoponto.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <Link href="/cliente/coletas/nova">
              <PlusCircle aria-hidden="true" data-icon="inline-start" />
              Solicitar coleta
            </Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="recentes" className="grid gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="recentes" className="text-lg font-semibold">
            Coletas recentes
          </h2>
          {recent.data && recent.data.pagination.total > RECENT_LIMIT && (
            <Link
              href="/cliente/coletas"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Ver todas
            </Link>
          )}
        </div>

        {recent.isPending && <CollectionListSkeleton count={RECENT_LIMIT} />}

        {recent.isError && (
          <ErrorState
            title="Não foi possível carregar suas coletas."
            message="Verifique sua conexão e tente novamente."
            onRetry={() => void recent.refetch()}
            retrying={recent.isFetching}
          />
        )}

        {recent.data && recent.data.items.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="Você ainda não solicitou nenhuma coleta."
            description="Quando solicitar, você acompanha cada etapa por aqui."
          />
        )}

        {recent.data && recent.data.items.length > 0 && (
          <ul className="grid gap-3">
            {recent.data.items.map((collection) => (
              <li key={collection.id}>
                <CollectionCard collection={collection} href={`/cliente/coletas/${collection.id}`} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
