// Próxima ação do coletor por status (13 §36, 11 §56). É somente apresentação:
// a API valida responsável, status atual e transição (DEC-041, 13 §55).

import type { CollectorEvent } from "./api/collections";
import { ApiError } from "./api/client";
import type { CollectionStatus } from "./collection-status";

export type CollectorAction = {
  event: CollectorEvent;
  label: string;
  // Texto do botão durante a requisição (13 §56).
  pendingLabel: string;
};

export const NEXT_ACTION: Record<CollectionStatus, CollectorAction | null> = {
  PENDENTE: { event: "accept", label: "Aceitar coleta", pendingLabel: "Aceitando..." },
  ACEITA: { event: "start", label: "Iniciar rota", pendingLabel: "Iniciando rota..." },
  A_CAMINHO: { event: "collect", label: "Confirmar recolhimento", pendingLabel: "Confirmando recolhimento..." },
  RECOLHIDA: { event: "deliver", label: "Confirmar entrega no ecoponto", pendingLabel: "Registrando entrega..." },
  ENTREGUE_ECOPONTO: { event: "complete", label: "Concluir coleta", pendingLabel: "Concluindo..." },
  CONCLUIDA: null,
};

const FAILURE_TITLE: Record<CollectorEvent, string> = {
  accept: "Não foi possível aceitar esta coleta.",
  start: "Não foi possível iniciar a rota.",
  collect: "Não foi possível confirmar o recolhimento.",
  deliver: "Não foi possível registrar a entrega.",
  complete: "Não foi possível concluir a coleta.",
};

export type ActionFailure = {
  title: string;
  description: string;
  // A coleta deixou de estar disponível para este coletor: a ação some e a
  // tela aponta para a lista de disponíveis (13 §60).
  unavailable: boolean;
  // O estado exibido pode estar desatualizado: recarregar da API (13 §77).
  resync: boolean;
};

// Traduz a recusa da API em feedback claro, sem jargão técnico (10 §89).
export function describeActionFailure(event: CollectorEvent, error: unknown): ActionFailure {
  const title = FAILURE_TITLE[event];

  if (!(error instanceof ApiError)) {
    return { title, description: "Tente novamente.", unavailable: false, resync: false };
  }

  // Aceite concorrente (13 §14, §60). A mensagem da API informa se foi outro
  // coletor ou o próprio (ex.: outra aba); nos dois casos a coleta saiu das disponíveis.
  if (error.code === "COLLECTION_ALREADY_ACCEPTED") {
    return { title, description: error.message, unavailable: true, resync: false };
  }

  // 404 inclui coleta atribuída a outro coletor, sem revelar que existe (DEC-070).
  if (error.status === 404) {
    return { title, description: "Esta coleta não está mais disponível para você.", unavailable: true, resync: false };
  }

  if (error.code === "INVALID_STATUS_TRANSITION" || error.code === "CONFLICT") {
    return {
      title,
      description: "A coleta foi atualizada. Confira o status atual antes de continuar.",
      unavailable: false,
      resync: true,
    };
  }

  // Sem conexão, ecoponto indisponível e demais recusas: o estado exibido é preservado (13 §59, §75).
  return { title, description: error.message, unavailable: false, resync: false };
}
