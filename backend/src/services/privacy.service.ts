import { randomBytes } from "node:crypto";
import { Types } from "mongoose";
import { ACTIVE_COLLECTION_STATUSES, INITIAL_COLLECTION_STATUS } from "../domain/collection-status.js";
import { Collection, Notification, User } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { recordAudit } from "./audit.service.js";
import { sessionVersionOf } from "./auth.service.js";
import { clearLoginFailures } from "./login-throttle.service.js";
import { toUserDetailView, type UserRecord } from "./user.views.js";

// Direitos do titular dos dados (LGPD art. 18, DEC-095): acesso aos próprios
// dados (exportação) e eliminação (exclusão da conta com anonimização).

const notFound = () => new AppError(404, "RESOURCE_NOT_FOUND", "Usuário não encontrado.");

// ---------------------------------------------------------------------------
// Exportação
// ---------------------------------------------------------------------------

// Tudo o que o sistema guarda sobre o titular, sem segredos (hash de senha,
// tokens, versão de sessão). Nas coletas atendidas por um coletor, os dados do
// cliente ficam de fora: pertencem a outra pessoa (09 §69).
export async function exportUserData(userId: string) {
  const id = new Types.ObjectId(userId);
  const user = await User.findById(id).lean();
  if (!user) throw notFound();

  const [asClient, asCollector, notifications] = await Promise.all([
    Collection.find({ usuarioId: id }).sort({ createdAt: -1 }).lean(),
    user.role === "COLETOR" ? Collection.find({ coletorId: id }).sort({ createdAt: -1 }).lean() : Promise.resolve([]),
    Notification.find({ usuarioId: id }).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    exportadoEm: new Date(),
    titular: toUserDetailView(user as unknown as UserRecord),
    coletasSolicitadas: asClient.map((collection) => ({
      id: String(collection._id),
      status: collection.status,
      enderecoColeta: collection.enderecoColeta,
      itensDescarte: collection.itensDescarte,
      observacoes: collection.observacoes ?? null,
      createdAt: collection.createdAt,
      acceptedAt: collection.acceptedAt ?? null,
      startedAt: collection.startedAt ?? null,
      collectedAt: collection.collectedAt ?? null,
      deliveredAt: collection.deliveredAt ?? null,
      completedAt: collection.completedAt ?? null,
    })),
    coletasAtendidas: asCollector.map((collection) => ({
      id: String(collection._id),
      status: collection.status,
      acceptedAt: collection.acceptedAt ?? null,
      startedAt: collection.startedAt ?? null,
      collectedAt: collection.collectedAt ?? null,
      deliveredAt: collection.deliveredAt ?? null,
      completedAt: collection.completedAt ?? null,
    })),
    notificacoes: notifications.map((notification) => ({
      tipo: notification.tipo,
      titulo: notification.titulo,
      mensagem: notification.mensagem,
      lida: notification.lida,
      createdAt: notification.createdAt,
    })),
  };
}

// ---------------------------------------------------------------------------
// Exclusão da conta
// ---------------------------------------------------------------------------

// Endereço que substitui o da coleta do titular excluído. Bairro, cidade e UF
// ficam, pois não identificam a pessoa e servem ao histórico da operação.
const REMOVED_STREET = { logradouro: "Endereço removido", numero: "—", complemento: null, cep: "00000000", localizacao: null };

export async function deleteOwnAccount(userId: string, senha: string): Promise<void> {
  const id = new Types.ObjectId(userId);
  const user = await User.findById(id).select("+senhaHash");
  if (!user) throw notFound();

  // Reautenticação: uma sessão aberta não basta para apagar a conta.
  if (!(await verifyPassword(user.senhaHash, senha))) {
    throw new AppError(400, "VALIDATION_ERROR", "Existem campos inválidos.", { senha: "Senha incorreta." });
  }

  // A conta de administrador mantém o sistema operável (DEC-075, DEC-087).
  if (user.role === "ADMIN") {
    throw new AppError(403, "FORBIDDEN", "A conta de administrador não pode ser excluída pelo perfil.");
  }

  // Coletas em andamento dependem dos dados de contato (BR-034, DEC-070).
  const pending =
    user.role === "CLIENTE"
      ? { usuarioId: id, status: { $in: [INITIAL_COLLECTION_STATUS, ...ACTIVE_COLLECTION_STATUSES] } }
      : { coletorId: id, status: { $in: ACTIVE_COLLECTION_STATUSES } };
  if (await Collection.exists(pending)) {
    throw new AppError(
      409,
      "USER_HAS_ACTIVE_COLLECTIONS",
      "Você tem coletas em andamento. A exclusão fica disponível quando todas forem concluídas.",
    );
  }

  const originalEmail = user.email;

  // Anonimização: o documento fica (as coletas o referenciam), sem dados
  // pessoais, sem senha utilizável e sem sessões válidas.
  user.nome = "Conta excluída";
  user.email = `excluido-${user.id}@excluido.invalid`;
  user.telefone = null;
  user.documento = null;
  user.dadosEmpresa = null;
  user.senhaHash = await hashPassword(randomBytes(32).toString("base64url"));
  user.status = "INATIVO";
  user.emailVerificacaoTokenHash = null;
  user.emailVerificacaoExpiraEm = null;
  user.senhaResetTokenHash = null;
  user.senhaResetExpiraEm = null;
  user.trocaSenhaObrigatoria = false;
  user.sessaoVersao = sessionVersionOf(user) + 1;
  user.excluidoEm = new Date();
  await user.save({ validateBeforeSave: false });

  await Promise.all([
    // Coletas concluídas do cliente: o histórico fica, sem o endereço identificável.
    user.role === "CLIENTE"
      ? Collection.updateMany(
          { usuarioId: id },
          {
            $set: {
              ...Object.fromEntries(Object.entries(REMOVED_STREET).map(([field, value]) => [`enderecoColeta.${field}`, value])),
              observacoes: null,
            },
          },
          { runValidators: false },
        )
      : Promise.resolve(),
    Notification.deleteMany({ usuarioId: id }),
    clearLoginFailures(originalEmail),
  ]);

  await recordAudit("CONTA_EXCLUIDA", { id: userId, role: user.role }, { tipo: "USUARIO", id });
}
