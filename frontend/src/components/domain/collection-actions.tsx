import { Button } from "@/components/ui/button";
import type { CollectorEvent } from "@/lib/api/collections";
import type { CollectionStatus } from "@/lib/collection-status";
import { NEXT_ACTION } from "@/lib/collector-actions";

type CollectionActionsProps = {
  status: CollectionStatus;
  pending?: boolean;
  onAction: (event: CollectorEvent) => void;
};

// Ação válida para a etapa atual (11 §56, 13 §36). Mostra somente uma ação,
// nunca ações incompatíveis com o status (13 §55, §65); em processamento, o
// botão fica desabilitado para evitar envio duplicado (13 §56–§57).
export function CollectionActions({ status, pending = false, onAction }: CollectionActionsProps) {
  const action = NEXT_ACTION[status];
  if (!action) return null;

  return (
    <Button size="lg" className="w-full sm:w-auto sm:justify-self-start" loading={pending} onClick={() => onAction(action.event)}>
      {pending ? action.pendingLabel : action.label}
    </Button>
  );
}
