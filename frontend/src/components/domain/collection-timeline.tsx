import { Check } from "lucide-react";
import type { ClientCollection } from "@/lib/api/collections";
import { COLLECTION_STATUSES, STATUS_INFO, statusIndex } from "@/lib/collection-status";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type TimelineCollection = Pick<
  ClientCollection,
  "status" | "createdAt" | "acceptedAt" | "startedAt" | "collectedAt" | "deliveredAt" | "completedAt"
>;

// Progresso da coleta (11 §55, 14 §57): etapas concluídas, atual e futuras,
// derivadas exclusivamente do status recebido da API (11 §124). Estados
// visuais não são status de domínio (14 §58).
export function CollectionTimeline({ collection }: { collection: TimelineCollection }) {
  const current = statusIndex(collection.status);

  return (
    <ol className="grid" aria-label="Andamento da coleta">
      {COLLECTION_STATUSES.map((status, index) => {
        const info = STATUS_INFO[status];
        const state = index < current ? "completed" : index === current ? "current" : "upcoming";
        const timestamp = collection[info.timestampField];
        const isLast = index === COLLECTION_STATUSES.length - 1;

        return (
          <li
            key={status}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-7 left-3.5 h-[calc(100%-1.75rem)] w-0.5 -translate-x-1/2",
                  index < current ? "bg-primary" : "bg-border",
                )}
              />
            )}

            <span
              aria-hidden="true"
              className={cn(
                "relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                state === "completed" && "border-primary bg-primary text-primary-foreground",
                state === "current" && "border-primary bg-background text-primary ring-4 ring-primary/15",
                state === "upcoming" && "border-border bg-background text-muted-foreground",
              )}
            >
              {state === "completed" ? <Check className="size-4" /> : index + 1}
            </span>

            <div className="grid gap-0.5 pt-0.5">
              <p className={cn("font-medium leading-tight", state === "upcoming" && "text-muted-foreground")}>
                {info.label}
                <span className="sr-only">
                  {state === "completed" ? " (concluída)" : state === "current" ? " (etapa atual)" : " (próxima)"}
                </span>
              </p>
              {state !== "upcoming" && (
                <p className="text-sm text-muted-foreground">
                  {state === "current" ? info.description : null}
                  {state === "current" && timestamp ? " " : null}
                  {timestamp ? <time dateTime={timestamp}>{formatDateTime(timestamp)}</time> : null}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
