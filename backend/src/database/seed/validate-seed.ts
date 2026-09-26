import { findCollectionInvariantViolations, type CollectionSnapshot } from "../../domain/collection-invariants.js";
import { COLLECTION_STATUSES, type CollectionStatus } from "../../domain/collection-status.js";
import { Collection, Ecopoint, Notification, User } from "../../models/index.js";

export type SeedSummary = {
  users: { ADMIN: number; CLIENTE_PF: number; CLIENTE_PJ: number; COLETOR: number };
  ecopoints: number;
  collections: Record<CollectionStatus, number>;
  notifications: number;
};

type IndexSpec = { collection: string; key: Record<string, unknown>; unique?: boolean };

// Índices exigidos pelo seed e pelos testes (20_SEED_DATA §8, 17_TESTING §63).
const REQUIRED_INDEXES: readonly IndexSpec[] = [
  { collection: "users", key: { email: 1 }, unique: true },
  { collection: "ecopoints", key: { localizacao: "2dsphere" } },
  { collection: "collections", key: { status: 1, createdAt: -1 } },
  { collection: "collections", key: { usuarioId: 1, createdAt: -1 } },
  { collection: "collections", key: { coletorId: 1, createdAt: -1 } },
];

const MODELS_BY_COLLECTION = {
  users: User,
  ecopoints: Ecopoint,
  collections: Collection,
  notifications: Notification,
} as const;

function sameKey(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Validação pós-seed (20_SEED_DATA §31–§33). Lança erro listando todas
// as inconsistências encontradas; retorna o resumo quando tudo está correto.
export async function validateSeed(): Promise<SeedSummary> {
  const problems: string[] = [];

  const [admin, clientePF, clientePJ, coletor] = await Promise.all([
    User.countDocuments({ role: "ADMIN" }),
    User.countDocuments({ role: "CLIENTE", tipoCadastro: "PF" }),
    User.countDocuments({ role: "CLIENTE", tipoCadastro: "PJ" }),
    User.countDocuments({ role: "COLETOR" }),
  ]);
  const users = { ADMIN: admin, CLIENTE_PF: clientePF, CLIENTE_PJ: clientePJ, COLETOR: coletor };

  for (const [perfil, count] of Object.entries(users)) {
    if (count < 1) problems.push(`Nenhum usuário ${perfil} encontrado.`);
  }

  // Senhas: somente hash Argon2id, nunca texto puro (DEC-020, 17_TESTING §57).
  const storedUsers = await User.find().select("+senhaHash").lean();

  for (const user of storedUsers) {
    if ("senha" in user) problems.push(`Usuário ${user.email} possui campo "senha" em texto puro.`);
    if (!user.senhaHash?.startsWith("$argon2id$")) problems.push(`Usuário ${user.email} sem hash Argon2id.`);
  }

  const ecopoints = await Ecopoint.countDocuments();
  const activeEcopoint = await Ecopoint.findOne({ status: "ATIVO" }).lean();

  if (!activeEcopoint) problems.push("Nenhum ecoponto ATIVO encontrado.");

  // Um status por estado da máquina (20_SEED_DATA §32).
  const collections = Object.fromEntries(COLLECTION_STATUSES.map((status) => [status, 0])) as Record<
    CollectionStatus,
    number
  >;
  const storedCollections = await Collection.find().lean();
  const userRoles = new Map(storedUsers.map((user) => [String(user._id), user.role]));
  const ecopointIds = new Set((await Ecopoint.find().select("_id").lean()).map((item) => String(item._id)));

  for (const collection of storedCollections) {
    const id = String(collection._id);
    collections[collection.status] += 1;

    for (const violation of findCollectionInvariantViolations(collection as CollectionSnapshot)) {
      problems.push(`Coleta ${id} (${collection.status}): ${violation}`);
    }

    if (userRoles.get(String(collection.usuarioId)) !== "CLIENTE") {
      problems.push(`Coleta ${id}: usuarioId não referencia um CLIENTE existente.`);
    }

    if (collection.coletorId && userRoles.get(String(collection.coletorId)) !== "COLETOR") {
      problems.push(`Coleta ${id}: coletorId não referencia um COLETOR existente.`);
    }

    if (collection.ecopontoId && !ecopointIds.has(String(collection.ecopontoId))) {
      problems.push(`Coleta ${id}: ecopontoId não referencia um ecoponto existente.`);
    }
  }

  for (const status of COLLECTION_STATUSES) {
    if (collections[status] < 1) problems.push(`Nenhuma coleta com status ${status}.`);
  }

  const storedNotifications = await Notification.find().lean();

  for (const notification of storedNotifications) {
    if (!userRoles.has(String(notification.usuarioId))) {
      problems.push(`Notificação ${String(notification._id)}: usuarioId não referencia um usuário existente.`);
    }
  }

  if (!storedNotifications.some((item) => item.lida) || !storedNotifications.some((item) => !item.lida)) {
    problems.push("O seed deve conter notificações lidas e não lidas (20_SEED_DATA §20).");
  }

  for (const spec of REQUIRED_INDEXES) {
    const indexes = await MODELS_BY_COLLECTION[spec.collection as keyof typeof MODELS_BY_COLLECTION].listIndexes();
    const found = indexes.find((index) => sameKey(index.key as Record<string, unknown>, spec.key));

    if (!found || (spec.unique && !found.unique)) {
      problems.push(`Índice ausente em ${spec.collection}: ${JSON.stringify(spec.key)}${spec.unique ? " (unique)" : ""}.`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`Seed inválido:\n- ${problems.join("\n- ")}`);
  }

  return { users, ecopoints, collections, notifications: storedNotifications.length };
}
