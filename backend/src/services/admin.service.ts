import { Types, isValidObjectId } from "mongoose";
import {
  COLLECTION_STATUSES,
  INITIAL_COLLECTION_STATUS,
  isTerminalStatus,
} from "../domain/collection-status.js";
import type { RecordStatus, TipoCadastro, UserRole } from "../domain/constants.js";
import { Collection, User } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { paginate, type Paginated } from "../utils/pagination.js";
import type { AdminCollectionsQuery } from "../validators/admin.validators.js";
import type { PaginationQuery } from "../validators/collection.validators.js";
import { toAdminView, type AdminCollectionView, type CollectionRecord } from "./collection.views.js";

const USER_REF_FIELDS = "nome email telefone";

// Coletas em andamento: já atribuídas e ainda não encerradas (13 §39).
const ACTIVE_COLLECTION_STATUSES = COLLECTION_STATUSES.filter(
  (status) => status !== INITIAL_COLLECTION_STATUS && !isTerminalStatus(status),
);

// :id inválido é tratado como inexistente (09 §43).
function toObjectId(id: string, notFound: () => AppError): Types.ObjectId {
  if (!isValidObjectId(id)) throw notFound();
  return new Types.ObjectId(id);
}

// ---------------------------------------------------------------------------
// Usuários (RF-041–RF-043, 06_API §22)
// ---------------------------------------------------------------------------

// Dados administrativos permitidos (RF-042, 06 §22.2): nunca senhaHash;
// `documento` não é coletado enquanto OQ-044 estiver aberta (DEC-066).
export type AdminUserView = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role: UserRole;
  tipoCadastro: TipoCadastro;
  dadosEmpresa: { razaoSocial: string | null; nomeFantasia: string | null } | null;
  status: RecordStatus;
  createdAt: Date;
  updatedAt: Date;
};

type UserRecord = {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  telefone?: string | null;
  role: UserRole;
  tipoCadastro: TipoCadastro;
  dadosEmpresa?: { razaoSocial?: string | null; nomeFantasia?: string | null } | null;
  status: RecordStatus;
  createdAt: Date;
  updatedAt: Date;
};

function toAdminUser(user: UserRecord): AdminUserView {
  return {
    id: String(user._id),
    nome: user.nome,
    email: user.email,
    telefone: user.telefone ?? null,
    role: user.role,
    tipoCadastro: user.tipoCadastro,
    dadosEmpresa: user.dadosEmpresa
      ? { razaoSocial: user.dadosEmpresa.razaoSocial ?? null, nomeFantasia: user.dadosEmpresa.nomeFantasia ?? null }
      : null,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const userNotFound = () => new AppError(404, "RESOURCE_NOT_FOUND", "Usuário não encontrado.");

// Mais recentes primeiro, como as demais listas (DEC-070).
export async function listUsers(pagination: PaginationQuery): Promise<Paginated<AdminUserView>> {
  const [records, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1, _id: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean(),
    User.countDocuments(),
  ]);

  return paginate((records as unknown as UserRecord[]).map(toAdminUser), total, pagination);
}

export async function getUser(id: string): Promise<AdminUserView> {
  const record = await User.findById(toObjectId(id, userNotFound)).lean();
  if (!record) throw userNotFound();
  return toAdminUser(record as unknown as UserRecord);
}

// Ativar ou desativar (RF-043, DEC-075):
// - contas ADMIN (inclusive a própria) não têm o status alterado por esta rota;
// - um coletor com coletas em andamento não pode ser desativado (OQ-055);
// - repetir o status atual não é erro (a operação é idempotente).
// A sessão de quem é desativado é encerrada na próxima requisição (requireAuth, 06 §27.3).
export async function updateUserStatus(id: string, status: RecordStatus): Promise<AdminUserView> {
  const userId = toObjectId(id, userNotFound);
  const current = await User.findById(userId).select("role status").lean();

  if (!current) throw userNotFound();

  if (current.role === "ADMIN") {
    throw new AppError(403, "FORBIDDEN", "O status de administradores não pode ser alterado.");
  }

  if (status === "INATIVO" && current.role === "COLETOR") {
    const active = await Collection.countDocuments({ coletorId: userId, status: { $in: ACTIVE_COLLECTION_STATUSES } });

    if (active > 0) {
      throw new AppError(
        409,
        "USER_HAS_ACTIVE_COLLECTIONS",
        active === 1
          ? "O coletor tem 1 coleta em andamento. Ela precisa ser concluída antes da desativação."
          : `O coletor tem ${active} coletas em andamento. Elas precisam ser concluídas antes da desativação.`,
      );
    }
  }

  const updated = await User.findOneAndUpdate(
    { _id: userId, role: { $ne: "ADMIN" } },
    { $set: { status } },
    { returnDocument: "after" },
  ).lean();

  if (!updated) throw userNotFound();
  return toAdminUser(updated as unknown as UserRecord);
}

// ---------------------------------------------------------------------------
// Coletas (RF-044–RF-045, 06_API §23) — somente leitura (OQ-055)
// ---------------------------------------------------------------------------

const collectionNotFound = () => new AppError(404, "RESOURCE_NOT_FOUND", "Coleta não encontrada.");

export async function listCollections(query: AdminCollectionsQuery): Promise<Paginated<AdminCollectionView>> {
  const filter = query.status ? { status: query.status } : {};
  const [records, total] = await Promise.all([
    Collection.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate("usuarioId", USER_REF_FIELDS)
      .populate("coletorId", USER_REF_FIELDS)
      .lean(),
    Collection.countDocuments(filter),
  ]);

  return paginate((records as unknown as CollectionRecord[]).map(toAdminView), total, query);
}

export async function getCollection(id: string): Promise<AdminCollectionView> {
  const record = await Collection.findById(toObjectId(id, collectionNotFound))
    .populate("usuarioId", USER_REF_FIELDS)
    .populate("coletorId", USER_REF_FIELDS)
    .lean();

  if (!record) throw collectionNotFound();
  return toAdminView(record as unknown as CollectionRecord);
}
