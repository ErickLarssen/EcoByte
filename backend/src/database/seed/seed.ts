import type { Types } from "mongoose";
import {
  requiredTimestampsFor,
  requiresColetor,
  requiresEcoponto,
  type CollectionStatus,
} from "../../domain/collection-status.js";
import { Collection, Ecopoint, Notification, User } from "../../models/index.js";
import { hashPassword } from "../../utils/password.js";
import { SEED_COLLECTIONS, SEED_ECOPOINT, SEED_NOTIFICATIONS, SEED_USERS, type SeedUserKey } from "./data.js";
import { validateSeed, type SeedSummary } from "./validate-seed.js";

const HOUR_MS = 60 * 60 * 1000;

// Intervalo entre etapas consecutivas do ciclo de vida nas coletas do seed.
const LIFECYCLE_STEP_MS = 2 * HOUR_MS;

// Seed bloqueado em produção (20_SEED_DATA §2.3, §29; DEC-034).
export function assertSeedAllowed(nodeEnv: string | undefined): void {
  if (nodeEnv === "production") {
    throw new Error("Seed não pode ser executado em produção.");
  }
}

type SeedOptions = {
  nodeEnv: string | undefined;
  // Data de referência; permite execuções determinísticas nos testes.
  now?: Date;
};

// Executa o seed mínimo na conexão Mongoose já aberta (20_SEED_DATA §30).
export async function runSeed({ nodeEnv, now = new Date() }: SeedOptions): Promise<SeedSummary> {
  assertSeedAllowed(nodeEnv);

  // Índices antes dos dados (20_SEED_DATA §30, passo 4).
  await Promise.all([User.createIndexes(), Collection.createIndexes(), Ecopoint.createIndexes(), Notification.createIndexes()]);

  // Limpeza respeitando referências: dependentes primeiro (20_SEED_DATA §28).
  await Notification.deleteMany({});
  await Collection.deleteMany({});
  await Ecopoint.deleteMany({});
  await User.deleteMany({});

  const userIds = new Map<SeedUserKey, Types.ObjectId>();

  for (const { key, senha, ...user } of SEED_USERS) {
    const created = await User.create({ ...user, senhaHash: await hashPassword(senha), status: "ATIVO" });
    userIds.set(key, created._id);
  }

  const ecopoint = await Ecopoint.create(SEED_ECOPOINT);

  type CreatedCollection = { id: Types.ObjectId; createdAt: Date; lastEventAt: Date };
  const collectionsByStatus = new Map<CollectionStatus, CreatedCollection>();

  for (const spec of SEED_COLLECTIONS) {
    const createdAt = new Date(now.getTime() - spec.createdHoursAgo * HOUR_MS);
    const timestamps = Object.fromEntries(
      requiredTimestampsFor(spec.status).map((field, index) => [
        field,
        new Date(createdAt.getTime() + (index + 1) * LIFECYCLE_STEP_MS),
      ]),
    );
    const lastEventAt = new Date(
      createdAt.getTime() + requiredTimestampsFor(spec.status).length * LIFECYCLE_STEP_MS,
    );

    const created = await Collection.create({
      usuarioId: userIds.get(spec.cliente),
      coletorId: requiresColetor(spec.status) ? userIds.get("coletor") : null,
      ecopontoId: requiresEcoponto(spec.status) ? ecopoint._id : null,
      enderecoColeta: spec.enderecoColeta,
      itensDescarte: spec.itensDescarte,
      status: spec.status,
      ...timestamps,
      createdAt,
      updatedAt: lastEventAt,
    });

    collectionsByStatus.set(spec.status, { id: created._id, createdAt, lastEventAt });
  }

  for (const spec of SEED_NOTIFICATIONS) {
    const collection = collectionsByStatus.get(spec.coleta);

    if (!collection) {
      throw new Error(`Notificação do seed referencia coleta inexistente: ${spec.coleta}.`);
    }

    // Criação/disponibilidade usam a data da solicitação; os demais eventos,
    // a data da última etapa da coleta.
    const isCreationEvent = spec.tipo === "COLETA_CRIADA" || spec.tipo === "NOVA_COLETA";
    const createdAt = isCreationEvent ? collection.createdAt : collection.lastEventAt;

    await Notification.create({
      usuarioId: userIds.get(spec.destinatario),
      tipo: spec.tipo,
      titulo: spec.titulo,
      mensagem: spec.mensagem,
      referencia: { tipo: "COLETA", id: collection.id },
      lida: spec.lida,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return validateSeed();
}
