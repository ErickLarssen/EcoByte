import { Types } from "mongoose";
import { AuditLog, User, type AuditAction } from "../models/index.js";
import { paginate, type Paginated } from "../utils/pagination.js";
import type { PaginationQuery } from "../validators/collection.validators.js";

// Registro de auditoria (DEC-094). A gravação acontece depois que a ação deu
// certo; uma falha ao gravar fica no log e não desfaz a ação já concluída.

export type AuditActor = { id: string | null; role: "ADMIN" | "CLIENTE" | "COLETOR" | "SISTEMA" };
export type AuditTarget = { tipo: "USUARIO" | "ECOPONTO"; id: string | Types.ObjectId };

export async function recordAudit(
  acao: AuditAction,
  ator: AuditActor,
  alvo: AuditTarget,
  detalhes: Record<string, unknown> | null = null,
): Promise<void> {
  try {
    await AuditLog.create({
      acao,
      ator: { id: ator.id ? new Types.ObjectId(ator.id) : null, role: ator.role },
      alvo: { tipo: alvo.tipo, id: new Types.ObjectId(String(alvo.id)) },
      detalhes,
    });
  } catch (error) {
    console.error("[backend] Falha ao registrar auditoria:", acao, error instanceof Error ? error.message : error);
  }
}

// Visão do registro para o administrador (06 §22.5). O nome do ator é lido
// agora: conta excluída aparece como "Conta excluída" (DEC-095).
export type AuditLogView = {
  id: string;
  acao: AuditAction;
  ator: { id: string | null; role: AuditActor["role"]; nome: string | null };
  alvo: { tipo: AuditTarget["tipo"]; id: string };
  detalhes: Record<string, unknown> | null;
  createdAt: Date;
};

export async function listAuditLogs(pagination: PaginationQuery): Promise<Paginated<AuditLogView>> {
  const { page, limit } = pagination;
  const [records, total] = await Promise.all([
    AuditLog.find()
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(),
  ]);

  const actorIds = [...new Set(records.flatMap((record) => (record.ator?.id ? [String(record.ator.id)] : [])))];
  const actors = await User.find({ _id: { $in: actorIds } }).select("nome").lean();
  const names = new Map(actors.map((actor) => [String(actor._id), actor.nome]));

  return paginate(
    records.map((record) => ({
      id: String(record._id),
      acao: record.acao as AuditAction,
      ator: {
        id: record.ator?.id ? String(record.ator.id) : null,
        role: record.ator?.role as AuditActor["role"],
        nome: record.ator?.id ? (names.get(String(record.ator.id)) ?? null) : null,
      },
      alvo: { tipo: record.alvo!.tipo as AuditTarget["tipo"], id: String(record.alvo!.id) },
      detalhes: (record.detalhes as Record<string, unknown> | null) ?? null,
      createdAt: record.createdAt as Date,
    })),
    total,
    pagination,
  );
}
