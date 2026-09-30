"use client";

import { ClipboardList, Hourglass, Users } from "lucide-react";
import Link from "next/link";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { CountTile } from "@/components/common/count-tile";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useAuth } from "@/components/features/auth/auth-provider";
import { CollectionCard } from "@/components/domain/collection-card";
import { useAdminCollections, useAdminUsers } from "@/hooks/use-admin";

const RECENT_LIMIT = 3;

// Painel administrativo (RF-040, 10 §67): totais vindos da API e as coletas
// mais recentes. Relatórios e indicadores dependem de OQ-016.
export function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.nome.split(" ")[0];
  const users = useAdminUsers(1, 1);
  const pending = useAdminCollections(1, "PENDENTE", 1);
  const recent = useAdminCollections(1, null, RECENT_LIMIT);

  return (
    <div className="grid gap-8">
      <section aria-labelledby="boas-vindas" className="grid gap-4">
        <h1 id="boas-vindas" className="text-2xl font-semibold tracking-tight">
          Olá{firstName ? `, ${firstName}` : ""}!
        </h1>
        <div className="grid gap-3 sm:grid-cols-3">
          <CountTile
            href="/admin/usuarios"
            label="Usuários"
            icon={Users}
            value={users.data?.pagination.total}
            failed={users.isError}
          />
          <CountTile
            href="/admin/coletas"
            label="Coletas"
            icon={ClipboardList}
            value={recent.data?.pagination.total}
            failed={recent.isError}
          />
          <CountTile
            href="/admin/coletas?status=PENDENTE"
            label="Aguardando coletor"
            icon={Hourglass}
            value={pending.data?.pagination.total}
            failed={pending.isError}
          />
        </div>
      </section>

      <section aria-labelledby="recentes" className="grid gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="recentes" className="text-lg font-semibold">
            Coletas recentes
          </h2>
          {recent.data && recent.data.pagination.total > RECENT_LIMIT && (
            <Link href="/admin/coletas" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Ver todas
            </Link>
          )}
        </div>

        {recent.isPending && <CollectionListSkeleton count={RECENT_LIMIT} />}

        {recent.isError && (
          <ErrorState
            title="Não foi possível carregar as coletas."
            message="Verifique sua conexão e tente novamente."
            onRetry={() => void recent.refetch()}
            retrying={recent.isFetching}
          />
        )}

        {recent.data && recent.data.items.length === 0 && (
          <EmptyState icon={ClipboardList} title="Nenhuma coleta solicitada até agora." />
        )}

        {recent.data && recent.data.items.length > 0 && (
          <ul className="grid gap-3">
            {recent.data.items.map((collection) => (
              <li key={collection.id}>
                <CollectionCard collection={collection} href={`/admin/coletas/${collection.id}`} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
