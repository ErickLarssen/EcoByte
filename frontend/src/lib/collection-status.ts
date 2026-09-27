// Definição central dos status da coleta no frontend (11 §125). Os valores
// espelham a máquina de estados do backend (DEC-004); o frontend apenas
// apresenta o status recebido da API e nunca decide transições (DEC-041).

export const COLLECTION_STATUSES = [
  "PENDENTE",
  "ACEITA",
  "A_CAMINHO",
  "RECOLHIDA",
  "ENTREGUE_ECOPONTO",
  "CONCLUIDA",
] as const;

export type CollectionStatus = (typeof COLLECTION_STATUSES)[number];

// Tom visual por status (10 §45): atenção, informação, positivo e sucesso.
export type StatusTone = "warning" | "info" | "positive" | "success";

type StatusInfo = {
  label: string;
  tone: StatusTone;
  // Descrição da etapa para o cliente, usada no detalhe e na linha do tempo.
  description: string;
  timestampField: "createdAt" | "acceptedAt" | "startedAt" | "collectedAt" | "deliveredAt" | "completedAt";
};

// Labels amigáveis (14 §80–§81).
export const STATUS_INFO: Record<CollectionStatus, StatusInfo> = {
  PENDENTE: {
    label: "Pendente",
    tone: "warning",
    description: "Solicitação recebida, aguardando um coletor.",
    timestampField: "createdAt",
  },
  ACEITA: {
    label: "Aceita",
    tone: "info",
    description: "Um coletor EcoByte aceitou a coleta.",
    timestampField: "acceptedAt",
  },
  A_CAMINHO: {
    label: "A caminho",
    tone: "info",
    description: "O coletor está a caminho do endereço.",
    timestampField: "startedAt",
  },
  RECOLHIDA: {
    label: "Recolhida",
    tone: "positive",
    description: "O material foi recolhido.",
    timestampField: "collectedAt",
  },
  ENTREGUE_ECOPONTO: {
    label: "Entregue no ecoponto",
    tone: "positive",
    description: "O material chegou ao ecoponto EcoByte.",
    timestampField: "deliveredAt",
  },
  CONCLUIDA: {
    label: "Concluída",
    tone: "success",
    description: "Coleta concluída.",
    timestampField: "completedAt",
  },
};

export function statusIndex(status: CollectionStatus): number {
  return COLLECTION_STATUSES.indexOf(status);
}
