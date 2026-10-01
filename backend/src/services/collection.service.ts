import { Types, isValidObjectId } from "mongoose";
import {
  COLLECTION_EVENTS,
  INITIAL_COLLECTION_STATUS,
  type CollectionEvent,
  type CollectionStatus,
} from "../domain/collection-status.js";
import { Collection, Ecopoint } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { notifyClientOfEvent } from "./notification.service.js";
import { paginate, type Paginated } from "../utils/pagination.js";
import type { CreateCollectionInput, PaginationQuery } from "../validators/collection.validators.js";
import {
  toClientView,
  toCollectorView,
  type ClientCollectionView,
  type CollectionRecord,
  type CollectorCollectionView,
} from "./collection.views.js";

const CLIENTE_FIELDS = "nome telefone";
const COLETOR_FIELDS = "nome";

const notFound = () => new AppError(404, "RESOURCE_NOT_FOUND", "Coleta não encontrada.");

// :id inválido é tratado como inexistente (09 §43, DEC-070).
function toObjectId(id: string): Types.ObjectId {
  if (!isValidObjectId(id)) throw notFound();
  return new Types.ObjectId(id);
}

// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------

// Criação (BR-012, BR-017, RF-014): status inicial PENDENTE, sem coletor;
// o solicitante vem da sessão, nunca do corpo da requisição (05 RT-005).
export async function createCollection(usuarioId: string, input: CreateCollectionInput): Promise<ClientCollectionView> {
  const created = await Collection.create({
    usuarioId,
    enderecoColeta: {
      ...input.enderecoColeta,
      complemento: input.enderecoColeta.complemento ?? null,
      localizacao: input.enderecoColeta.localizacao ?? null,
    },
    itensDescarte: input.itensDescarte,
    observacoes: input.observacoes ?? null,
    status: INITIAL_COLLECTION_STATUS,
  });

  return toClientView(created.toObject() as unknown as CollectionRecord);
}

export async function listClientCollections(
  usuarioId: string,
  pagination: PaginationQuery,
): Promise<Paginated<ClientCollectionView>> {
  const filter = { usuarioId: new Types.ObjectId(usuarioId) };
  const [records, total] = await Promise.all([
    Collection.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .populate("coletorId", COLETOR_FIELDS)
      .lean(),
    Collection.countDocuments(filter),
  ]);

  return paginate((records as unknown as CollectionRecord[]).map(toClientView), total, pagination);
}

export async function getClientCollection(id: string, usuarioId: string): Promise<ClientCollectionView> {
  const record = await Collection.findOne({ _id: toObjectId(id), usuarioId: new Types.ObjectId(usuarioId) })
    .populate("coletorId", COLETOR_FIELDS)
    .lean();

  if (!record) throw notFound();
  return toClientView(record as unknown as CollectionRecord);
}

// ---------------------------------------------------------------------------
// Coletor
// ---------------------------------------------------------------------------

// Disponíveis: PENDENTE e sem coletor (13 §9), por ordem de solicitação (DEC-070).
export async function listAvailableCollections(
  coletorId: string,
  pagination: PaginationQuery,
): Promise<Paginated<CollectorCollectionView>> {
  const filter = { status: "PENDENTE" as const, coletorId: null };
  const [records, total] = await Promise.all([
    Collection.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean(),
    Collection.countDocuments(filter),
  ]);

  return paginate(
    (records as unknown as CollectionRecord[]).map((record) => toCollectorView(record, coletorId)),
    total,
    pagination,
  );
}

// Atribuídas ao coletor autenticado, em qualquer status (RF-028, DEC-064).
export async function listAssignedCollections(
  coletorId: string,
  pagination: PaginationQuery,
): Promise<Paginated<CollectorCollectionView>> {
  const filter = { coletorId: new Types.ObjectId(coletorId) };
  const [records, total] = await Promise.all([
    Collection.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .populate("usuarioId", CLIENTE_FIELDS)
      .lean(),
    Collection.countDocuments(filter),
  ]);

  return paginate(
    (records as unknown as CollectionRecord[]).map((record) => toCollectorView(record, coletorId)),
    total,
    pagination,
  );
}

// Coletor consulta coletas PENDENTE (antes de aceitar) e as atribuídas a ele (DEC-070).
export async function getCollectorCollection(id: string, coletorId: string): Promise<CollectorCollectionView> {
  const record = await Collection.findOne({
    _id: toObjectId(id),
    $or: [{ status: "PENDENTE", coletorId: null }, { coletorId: new Types.ObjectId(coletorId) }],
  })
    .populate("usuarioId", CLIENTE_FIELDS)
    .lean();

  if (!record) throw notFound();
  return toCollectorView(record as unknown as CollectionRecord, coletorId);
}

// ---------------------------------------------------------------------------
// Transições (14_STATE_MACHINE §19–§25, §62–§67)
// ---------------------------------------------------------------------------

function invalidTransition(currentStatus: CollectionStatus, requestedStatus: CollectionStatus): AppError {
  return new AppError(422, "INVALID_STATUS_TRANSITION", "Transição de status inválida.", {
    currentStatus,
    requestedStatus,
  });
}

// Explica por que a atualização atômica não encontrou a coleta no estado
// esperado, a partir do estado atual persistido (DEC-070).
async function explainRejectedEvent(
  collectionId: Types.ObjectId,
  coletorId: string,
  event: CollectionEvent,
): Promise<AppError> {
  const current = await Collection.findById(collectionId).select("status coletorId").lean();

  if (!current) return notFound();

  const assignedTo = current.coletorId ? String(current.coletorId) : null;

  if (event === "accept") {
    return new AppError(
      409,
      "COLLECTION_ALREADY_ACCEPTED",
      assignedTo === coletorId ? "Você já aceitou esta coleta." : "A coleta já foi aceita por outro coletor.",
    );
  }

  // Coleta de outro coletor: não revela que existe (DEC-070).
  if (assignedTo !== null && assignedTo !== coletorId) return notFound();

  const transition = COLLECTION_EVENTS[event];

  if (current.status !== transition.from) {
    return invalidTransition(current.status, transition.to);
  }

  // O estado mudou entre a tentativa e a leitura; a operação pode ser repetida.
  return new AppError(409, "CONFLICT", "A coleta foi alterada por outra operação. Tente novamente.");
}

// Executa um evento do coletor com uma única atualização atômica filtrada
// pelo status de origem e pelo responsável (DEC-006, BR-051–BR-053).
// Se o filtro não corresponder, nenhum campo é alterado (14 §48, §67).
export async function applyCollectorEvent(
  id: string,
  coletorId: string,
  event: CollectionEvent,
): Promise<CollectorCollectionView> {
  const collectionId = toObjectId(id);
  const coletorObjectId = new Types.ObjectId(coletorId);
  const transition = COLLECTION_EVENTS[event];
  const now = new Date();

  const filter =
    event === "accept"
      ? { _id: collectionId, status: transition.from, coletorId: null }
      : { _id: collectionId, status: transition.from, coletorId: coletorObjectId };

  const changes: Record<string, unknown> = { status: transition.to, [transition.timestampField]: now };

  if (event === "accept") {
    changes.coletorId = coletorObjectId;
  }

  if (event === "deliver") {
    // Destino da entrega: o ecoponto central ativo (DEC-053).
    const ecopoint = await Ecopoint.findOne({ status: "ATIVO" }).select("_id").lean();

    if (!ecopoint) {
      const deliverable = await Collection.exists(filter);
      if (!deliverable) throw await explainRejectedEvent(collectionId, coletorId, event);

      throw new AppError(409, "ECOPOINT_UNAVAILABLE", "Nenhum ecoponto ativo disponível para receber a entrega.");
    }

    changes.ecopontoId = ecopoint._id;
  }

  const updated = await Collection.findOneAndUpdate(filter, { $set: changes }, { returnDocument: "after" })
    .populate("usuarioId", CLIENTE_FIELDS)
    .lean();

  if (!updated) throw await explainRejectedEvent(collectionId, coletorId, event);

  // Somente após a transição confirmada: o cliente é avisado da etapa (DEC-077).
  const record = updated as unknown as CollectionRecord;
  const cliente = record.usuarioId && "_id" in record.usuarioId ? record.usuarioId._id : record.usuarioId;
  if (cliente) await notifyClientOfEvent(cliente, collectionId, event);

  return toCollectorView(record, coletorId);
}
