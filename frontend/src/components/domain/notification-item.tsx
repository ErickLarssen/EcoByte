import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/lib/api/notifications";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type NotificationItemProps = {
  notification: AppNotification;
  // Destino da coleta relacionada, quando houver.
  href?: string;
  pending?: boolean;
  onMarkAsRead: (id: string) => void;
};

// Notificação (11 §52): ícone, título, mensagem, data e estado de leitura,
// indicado por texto e não apenas por cor (12 §33).
export function NotificationItem({ notification, href, pending = false, onMarkAsRead }: NotificationItemProps) {
  const unread = !notification.lida;

  return (
    <article
      aria-labelledby={`notificacao-${notification.id}`}
      className={cn("flex gap-3 surface-card p-4", unread && "ring-primary/30")}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          unread ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        <Bell className="size-5" />
      </span>

      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id={`notificacao-${notification.id}`} className="font-semibold">
            {notification.titulo}
            {unread && <span className="ml-2 text-xs font-semibold text-primary">Não lida</span>}
          </h2>
          <span className="text-sm text-muted-foreground">
            <time dateTime={notification.createdAt}>{formatDateTime(notification.createdAt)}</time>
          </span>
        </div>
        <p className="text-sm break-words text-muted-foreground">{notification.mensagem}</p>

        {(href || unread) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {href && (
              <Button asChild variant="outline" size="sm">
                <Link href={href} onClick={() => unread && onMarkAsRead(notification.id)}>
                  Ver coleta
                  <ChevronRight aria-hidden="true" data-icon="inline-end" />
                </Link>
              </Button>
            )}
            {unread && (
              <Button variant="ghost" size="sm" loading={pending} onClick={() => onMarkAsRead(notification.id)}>
                Marcar como lida
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
