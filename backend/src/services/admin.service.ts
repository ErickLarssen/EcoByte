import { Types, isValidObjectId } from "mongoose";
import { ACTIVE_COLLECTION_STATUSES } from "../domain/collection-status.js";
import type { RecordStatus } from "../domain/constants.js";
import { Collection, User } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { paginate, type Paginated } from "../utils/pagination.js";
import { hashPassword } from "../utils/password.js";
import type { AdminCollectionsQuery, CreateCollectorInput } from "../validators/admin.validators.js";
import type { PaginationQuery } from "../validators/collection.validators.js";
import { toAdminView, type AdminCollectionView, type CollectionRecord } from "./collection.views.js";
import { toUserDetailView, type UserDetailView, type UserRecord } from "./user.views.js";

const USER_REF_FIELDS = "nome email telefone";


// :id inválido é tratado como inexistente (09 §43).
function toObjectId(id: string, notFound: () => AppError): Types.ObjectId {
  if (!isValidObjectId(id)) throw notFound();
  return new Types.ObjectId(id);
}

// ---------------------------------------------------------------------------
// Usuários (RF-041–RF-043, 06_API §22)
// ---------------------------------------------------------------------------

const userNotFound = () => new AppError(404, "RESOURCE_NOT_FOUND", "Usuário não encontrado.");

// Mais recentes primeiro, como as demais listas (DEC-070).
export async function listUsers(pagination: PaginationQuery): Promise<Paginated<UserDetailView>> {
  const [records, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1, _id: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean(),
    User.countDocuments(),
  ]);

  return paginate((records as unknown as UserRecord[]).map(toUserDetailView), total, pagination);
}

export async function getUser(id: string): Promise<UserDetailView> {
  const record = await User.findById(toObjectId(id, userNotFound)).lean();
  if (!record) throw userNotFound();
  return toUserDetailView(record as unknown as UserRecord);
}

// Ativar ou desativar (RF-043, DEC-075):
// - contas ADMIN (inclusive a própria) não têm o status alterado por esta rota;
// - um coletor com coletas em andamento não pode ser desativado (OQ-055);
// - repetir o status atual não é erro (a operação é idempotente).
// A sessão de quem é desativado é encerrada na próxima requisição (requireAuth, 06 §27.3).
export async function updateUserStatus(id: string, status: RecordStatus): Promise<UserDetailView> {
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
  return toUserDetailView(updated as unknown as UserRecord);
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

// ---------------------------------------------------------------------------
// Cadastro de coletor (DEC-083)
// ---------------------------------------------------------------------------

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

const emailInUse = () => new AppError(409, "EMAIL_ALREADY_EXISTS", "Este e-mail já está cadastrado.");

// O administrador cadastra coletores: não há cadastro público de COLETOR
// (DEC-066). A senha é provisória e deve ser trocada no primeiro acesso; o
// e-mail já conta como verificado, pois a conta é criada pela equipe (DEC-082).
export async function createCollector(input: CreateCollectorInput): Promise<UserDetailView> {
  if (await User.exists({ email: input.email })) throw emailInUse();

  try {
    const user = await User.create({
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
      senhaHash: await hashPassword(input.senha),
      role: "COLETOR",
      tipoCadastro: "PF",
      status: "ATIVO",
      emailVerificado: true,
      trocaSenhaObrigatoria: true,
    });

    return toUserDetailView(user.toObject() as unknown as UserRecord);
  } catch (error) {
    if (isDuplicateKeyError(error)) throw emailInUse();
    throw error;
  }
}
