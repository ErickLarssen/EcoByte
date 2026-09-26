import {
  COLLECTION_STATUSES,
  LIFECYCLE_TIMESTAMP_FIELDS,
  isCollectionStatus,
  requiredTimestampsFor,
  requiresColetor,
  requiresEcoponto,
  type LifecycleTimestampField,
} from "./collection-status.js";

// Estado persistido de uma coleta relevante para as invariantes.
export type CollectionSnapshot = {
  status: unknown;
  coletorId?: unknown;
  ecopontoId?: unknown;
  createdAt?: Date | null;
} & Partial<Record<LifecycleTimestampField, Date | null>>;

function isFilled(value: unknown): boolean {
  return value !== null && value !== undefined;
}

// Verifica a coerência entre status, responsáveis e timestamps
// (DEC-005, DEC-007, DEC-053, 14_STATE_MACHINE §29–§31.1, 20_SEED_DATA §33).
// Retorna a lista de violações; lista vazia significa documento coerente.
// Não valida transições — isso é responsabilidade dos eventos (collection-status).
export function findCollectionInvariantViolations(collection: CollectionSnapshot): string[] {
  const violations: string[] = [];
  const { status } = collection;

  if (!isCollectionStatus(status)) {
    return [`status inválido: ${String(status)}. Valores aceitos: ${COLLECTION_STATUSES.join(", ")}.`];
  }

  if (requiresColetor(status) && !isFilled(collection.coletorId)) {
    violations.push(`coletorId é obrigatório no status ${status}.`);
  }

  if (!requiresColetor(status) && isFilled(collection.coletorId)) {
    violations.push(`coletorId deve ser nulo no status ${status}.`);
  }

  if (requiresEcoponto(status) && !isFilled(collection.ecopontoId)) {
    violations.push(`ecopontoId é obrigatório no status ${status}.`);
  }

  if (!requiresEcoponto(status) && isFilled(collection.ecopontoId)) {
    violations.push(`ecopontoId deve ser nulo no status ${status}.`);
  }

  const required = requiredTimestampsFor(status);

  for (const field of LIFECYCLE_TIMESTAMP_FIELDS) {
    const filled = isFilled(collection[field]);

    if (required.includes(field) && !filled) {
      violations.push(`${field} é obrigatório no status ${status}.`);
    }

    if (!required.includes(field) && filled) {
      violations.push(`${field} deve ser nulo no status ${status}.`);
    }
  }

  // Ordem temporal: createdAt ≤ acceptedAt ≤ … ≤ completedAt (14_STATE_MACHINE §29).
  const sequence: Array<[string, Date | null | undefined]> = [
    ["createdAt", collection.createdAt],
    ...LIFECYCLE_TIMESTAMP_FIELDS.map((field): [string, Date | null | undefined] => [field, collection[field]]),
  ];
  const present = sequence.filter((entry): entry is [string, Date] => entry[1] instanceof Date);

  for (let index = 1; index < present.length; index += 1) {
    const [previousField, previousDate] = present[index - 1]!;
    const [field, date] = present[index]!;

    if (date.getTime() < previousDate.getTime()) {
      violations.push(`${field} não pode ser anterior a ${previousField}.`);
    }
  }

  return violations;
}
