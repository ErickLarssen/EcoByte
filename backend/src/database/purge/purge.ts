import mongoose, { Types } from "mongoose";
import { z } from "zod";
import { Collection, Notification, User } from "../../models/index.js";
import { recordAudit } from "../../services/audit.service.js";
import { clearLoginFailures } from "../../services/login-throttle.service.js";
import { emailSchema } from "../../validators/auth.validators.js";

// Remoção definitiva de perfis (DEC-096), para limpar contas de demonstração.
// Diferente da exclusão pelo titular (DEC-095), que anonimiza, aqui o usuário
// e os dados ligados a ele saem do banco. Roda pela linha de comando, com a
// conexão do responsável, e por padrão só simula.

// Texto que autoriza a remoção (PURGE_CONFIRMAR). Sem ele, só a simulação.
export const PURGE_CONFIRMATION = "APAGAR";

const envSchema = z.object({
  emails: z
    .array(emailSchema)
    .min(1, "Informe ao menos um e-mail em PURGE_EMAILS.")
    .max(50, "Informe no máximo 50 e-mails por execução."),
  confirmar: z.boolean(),
});

export type PurgeInput = z.infer<typeof envSchema>;

// PURGE_EMAILS: e-mails separados por vírgula ou ponto e vírgula.
export function parsePurgeEnv(source: NodeJS.ProcessEnv): PurgeInput {
  const emails = (source.PURGE_EMAILS ?? "")
    .split(/[,;]/)
    .map((email) => email.trim())
    .filter(Boolean);

  const parsed = envSchema.safeParse({
    emails: [...new Set(emails.map((email) => email.toLowerCase()))],
    confirmar: source.PURGE_CONFIRMAR === PURGE_CONFIRMATION,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => `PURGE_EMAILS: ${issue.message}`).join("\n"));
  }
  return parsed.data;
}

export type PurgeUser = { id: string; email: string; nome: string; role: string };

export type PurgePlan = {
  users: PurgeUser[];
  naoEncontrados: string[];
  coletas: number;
  notificacoes: number;
  sessoes: number;
  // Motivos que impedem a remoção. Com algum, nada é apagado.
  bloqueios: string[];
};

const sessionFilter = (ids: string[]) => ({
  // Sessões guardadas como JSON (connect-mongo, stringify padrão) ou como objeto.
  $or: [
    { session: { $regex: `"userId":"(${ids.join("|")})"` } },
    { "session.userId": { $in: ids } },
  ],
});

function sessionsCollection() {
  return mongoose.connection.db!.collection("sessions");
}

// Levanta tudo o que seria removido e o que impede a remoção. Não altera nada.
export async function planPurge(emails: string[]): Promise<PurgePlan> {
  const found = await User.find({ email: { $in: emails } }).select("nome email role").lean();
  const users = found.map((user) => ({ id: String(user._id), email: user.email, nome: user.nome, role: user.role }));
  const ids = users.map((user) => new Types.ObjectId(user.id));
  const idStrings = users.map((user) => user.id);
  const bloqueios: string[] = [];

  // O sistema precisa continuar com ao menos um administrador (DEC-087).
  const adminsToRemove = users.filter((user) => user.role === "ADMIN").length;
  if (adminsToRemove > 0 && (await User.countDocuments({ role: "ADMIN" })) - adminsToRemove < 1) {
    bloqueios.push("A remoção deixaria o sistema sem nenhum administrador.");
  }

  // Coletas de clientes de fora da lista atendidas por um perfil da lista:
  // são de outra pessoa e não são apagadas.
  const foreign = await Collection.find({ coletorId: { $in: ids }, usuarioId: { $nin: ids } })
    .select("_id coletorId")
    .lean();
  for (const collection of foreign) {
    const collector = users.find((user) => user.id === String(collection.coletorId));
    bloqueios.push(
      `O coletor ${collector?.email ?? "?"} atendeu a coleta ${String(collection._id)}, de um cliente que não está na lista.`,
    );
  }

  const collectionIds = (await Collection.find({ usuarioId: { $in: ids } }).select("_id").lean()).map((c) => c._id);
  const [notificacoes, sessoes] = await Promise.all([
    Notification.countDocuments({ $or: [{ usuarioId: { $in: ids } }, { "referencia.id": { $in: collectionIds } }] }),
    idStrings.length > 0 ? sessionsCollection().countDocuments(sessionFilter(idStrings)) : Promise.resolve(0),
  ]);

  return {
    users,
    naoEncontrados: emails.filter((email) => !users.some((user) => user.email === email)),
    coletas: collectionIds.length,
    notificacoes,
    sessoes,
    bloqueios,
  };
}

export type PurgeResult = { usuarios: number; coletas: number; notificacoes: number; sessoes: number };

// Remove o que o plano levantou. Recusa se houver bloqueio. Os registros de
// auditoria ficam (DEC-094): não têm dados pessoais, e a própria remoção é
// registrada.
export async function executePurge(plan: PurgePlan): Promise<PurgeResult> {
  if (plan.bloqueios.length > 0) throw new Error("Há bloqueios: nada foi apagado.");
  if (plan.users.length === 0) return { usuarios: 0, coletas: 0, notificacoes: 0, sessoes: 0 };

  const ids = plan.users.map((user) => new Types.ObjectId(user.id));
  const collectionIds = (await Collection.find({ usuarioId: { $in: ids } }).select("_id").lean()).map((c) => c._id);

  // Sessões primeiro: quem estiver conectado perde o acesso na hora.
  const sessoes = await sessionsCollection().deleteMany(sessionFilter(plan.users.map((user) => user.id)));
  const notificacoes = await Notification.deleteMany({
    $or: [{ usuarioId: { $in: ids } }, { "referencia.id": { $in: collectionIds } }],
  });
  const coletas = await Collection.deleteMany({ _id: { $in: collectionIds } });
  await Promise.all(plan.users.map((user) => clearLoginFailures(user.email)));
  const usuarios = await User.deleteMany({ _id: { $in: ids } });

  for (const user of plan.users) {
    await recordAudit("USUARIO_REMOVIDO", { id: null, role: "SISTEMA" }, { tipo: "USUARIO", id: user.id }, { role: user.role });
  }

  return {
    usuarios: usuarios.deletedCount,
    coletas: coletas.deletedCount,
    notificacoes: notificacoes.deletedCount,
    sessoes: sessoes.deletedCount,
  };
}
