"use client";

import { BellOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { NotificationItem } from "@/components/domain/notification-item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useMarkNotificationAsRead, useNotifications } from "@/hooks/use-notifications";
import type { AppNotification } from "@/lib/api/notifications";
import { PAGE_PARAM, pageFromParams } from "@/lib/pagination";

const PAGE_SIZE = 10;

type NotificationCenterProps = {
  // Caminho da página (ex.: "/cliente/notificacoes").
  path: string;
  // Detalhe da coleta na área do usuário (ex.: "/cliente/coletas").
  collectionsPath: string;
};

// Central de notificações (11 §51): lista paginada, mais recentes primeiro,
// marcar como lida e acesso à coleta relacionada.
export function NotificationCenter({ path, collectionsPath }: NotificationCenterProps) {
  const searchParams = useSearchParams();
  const page = pageFromParams(searchParams.get(PAGE_PARAM));
  const query = useNotifications(page, PAGE_SIZE);
  const markAsRead = useMarkNotificationAsRead();

  const hrefFor = (notification: AppNotification) =>
    notification.referencia?.tipo === "COLETA" ? `${collectionsPath}/${notification.referencia.id}` : undefined;

  if (query.isPending) return <CollectionListSkeleton />;

  if (query.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar suas notificações."
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
        icon={BellOff}
        title={beyondLastPage ? "Esta página não existe." : "Você não tem notificações."}
        description={beyondLastPage ? undefined : "Avisamos por aqui a cada etapa das suas coletas."}
        action={
          beyondLastPage ? (
            <Button asChild variant="outline">
              <Link href={path}>Ir para a primeira página</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4" aria-busy={query.isPlaceholderData || undefined}>
      {markAsRead.isError && (
        <Alert variant="destructive" className="border-destructive/30">
          <AlertDescription>Não foi possível marcar a notificação como lida. Tente novamente.</AlertDescription>
        </Alert>
      )}
      <ul className="grid gap-3">
        {items.map((notification) => (
          <li key={notification.id}>
            <NotificationItem
              notification={notification}
              href={hrefFor(notification)}
              pending={markAsRead.isPending && markAsRead.variables === notification.id}
              onMarkAsRead={(id) => markAsRead.mutate(id)}
            />
          </li>
        ))}
      </ul>
      <Pagination pagination={pagination} hrefForPage={(target) => `${path}?${PAGE_PARAM}=${target}`} />
    </div>
  );
}
