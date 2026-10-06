// Máquina de estados da coleta — fonte única (14_STATE_MACHINE §93–§96, DEC-004).
// Nenhuma outra parte do sistema deve redefinir status ou transições.

export const COLLECTION_STATUSES = [
  "PENDENTE",
  "ACEITA",
  "A_CAMINHO",
  "RECOLHIDA",
  "ENTREGUE_ECOPONTO",
  "CONCLUIDA",
] as const;

export type CollectionStatus = (typeof COLLECTION_STATUSES)[number];

export const INITIAL_COLLECTION_STATUS: CollectionStatus = "PENDENTE";

// Timestamps do ciclo de vida, na ordem em que são preenchidos (DEC-007).
export const LIFECYCLE_TIMESTAMP_FIELDS = [
  "acceptedAt",
  "startedAt",
  "collectedAt",
  "deliveredAt",
  "completedAt",
] as const;

export type LifecycleTimestampField = (typeof LIFECYCLE_TIMESTAMP_FIELDS)[number];

type TransitionDefinition = {
  readonly from: CollectionStatus;
  readonly to: CollectionStatus;
  readonly timestampField: LifecycleTimestampField;
};

// Eventos T1–T5 (14_STATE_MACHINE §19–§25). Cada evento corresponde a um
// endpoint de ação (DEC-064) e preenche exatamente um timestamp.
export const COLLECTION_EVENTS = {
  accept: { from: "PENDENTE", to: "ACEITA", timestampField: "acceptedAt" },
  start: { from: "ACEITA", to: "A_CAMINHO", timestampField: "startedAt" },
  collect: { from: "A_CAMINHO", to: "RECOLHIDA", timestampField: "collectedAt" },
  deliver: { from: "RECOLHIDA", to: "ENTREGUE_ECOPONTO", timestampField: "deliveredAt" },
  complete: { from: "ENTREGUE_ECOPONTO", to: "CONCLUIDA", timestampField: "completedAt" },
} as const satisfies Record<string, TransitionDefinition>;

export type CollectionEvent = keyof typeof COLLECTION_EVENTS;

// Matriz de transições derivada dos eventos (14_STATE_MACHINE §94),
// para que status, eventos e transições não possam divergir.
function buildTransitions(): Record<CollectionStatus, CollectionStatus[]> {
  const transitions = Object.fromEntries(COLLECTION_STATUSES.map((status) => [status, []])) as unknown as Record<
    CollectionStatus,
    CollectionStatus[]
  >;

  for (const { from, to } of Object.values(COLLECTION_EVENTS)) {
    transitions[from].push(to);
  }

  return transitions;
}

export const COLLECTION_TRANSITIONS: Readonly<Record<CollectionStatus, readonly CollectionStatus[]>> =
  buildTransitions();

export function isCollectionStatus(value: unknown): value is CollectionStatus {
  return typeof value === "string" && (COLLECTION_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: CollectionStatus, to: CollectionStatus): boolean {
  return COLLECTION_TRANSITIONS[from].includes(to);
}

export function isTerminalStatus(status: CollectionStatus): boolean {
  return COLLECTION_TRANSITIONS[status].length === 0;
}

// Resultado de aplicar um evento ao status atual. Não lança erro:
// quem chama decide a resposta (ex.: 422 INVALID_STATUS_TRANSITION).
export type EventResolution =
  | { allowed: true; from: CollectionStatus; to: CollectionStatus; timestampField: LifecycleTimestampField }
  | { allowed: false; from: CollectionStatus; requiredFrom: CollectionStatus; to: CollectionStatus };

export function resolveEvent(current: CollectionStatus, event: CollectionEvent): EventResolution {
  const transition = COLLECTION_EVENTS[event];

  if (current !== transition.from) {
    return { allowed: false, from: current, requiredFrom: transition.from, to: transition.to };
  }

  return { allowed: true, from: current, to: transition.to, timestampField: transition.timestampField };
}

// Timestamps que devem estar preenchidos em cada status (14_STATE_MACHINE §30).
// Os demais timestamps do ciclo devem permanecer nulos.
export function requiredTimestampsFor(status: CollectionStatus): readonly LifecycleTimestampField[] {
  const filledCount = COLLECTION_STATUSES.indexOf(status);
  return LIFECYCLE_TIMESTAMP_FIELDS.slice(0, filledCount);
}

// coletorId é atribuído no aceite e nunca removido (DEC-005, 14_STATE_MACHINE §31).
export function requiresColetor(status: CollectionStatus): boolean {
  return status !== "PENDENTE";
}

// ecopontoId é atribuído na entrega (DEC-053, 14_STATE_MACHINE §31.1).
export function requiresEcoponto(status: CollectionStatus): boolean {
  return status === "ENTREGUE_ECOPONTO" || status === "CONCLUIDA";
}

// Coletas em andamento: já atribuídas e ainda não concluídas (13 §39). Usado na
// desativação de coletor (DEC-075) e no grupo "Em andamento" (DEC-084).
export const ACTIVE_COLLECTION_STATUSES: readonly CollectionStatus[] = COLLECTION_STATUSES.filter(
  (status) => status !== INITIAL_COLLECTION_STATUS && !isTerminalStatus(status),
);
