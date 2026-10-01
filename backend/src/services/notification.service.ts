import { Types, isValidObjectId } from "mongoose";
import type { CollectionEvent } from "../domain/collection-status.js";
import { Notification } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { paginate, type Paginated } from "../utils/pagination.js";
import type { NotificationsQuery } from "../validators/notification.validators.js";

// Notificações do cliente a cada etapa da coleta (RF-050, DEC-077). Os tipos e
// textos seguem a proposta da OQ-013, já usada no seed (20_SEED_DATA §20).
const CLIENT_NOTIFICATIONS: Record<CollectionEvent, { tipo: string; titulo: string; mensagem: string }> = {
  accept: { tipo: "COLETA_ACEITA", titulo: "Coleta aceita", mensagem: "Um coletor EcoByte aceitou a sua coleta." },
  start: {
    tipo: "COLETA_A_CAMINHO",
    titulo: "Coletor a caminho",
    mensagem: "O coletor está a caminho do endereço da coleta.",
  },
  collect: {
    tipo: "COLETA_RECOLHIDA",
    titulo: "Material recolhido",
    mensagem: "O material da sua coleta foi recolhido.",
  },
  deliver: {
    tipo: "COLETA_ENTREGUE_ECOPONTO",
    titulo: "Entregue no ecoponto",
    mensagem: "O material da sua coleta foi entregue no ecoponto EcoByte.",
  },
  complete: {
    tipo: "COLETA_CONCLUIDA",
    titulo: "Coleta concluída",
    mensagem: "Sua coleta foi concluída. Obrigado por descartar corretamente!",
  },
};

// Registra a notificação do cliente após uma transição já confirmada.
// É um efeito secundário: uma falha aqui é registrada no log e não desfaz
// nem recusa a transição, que já foi persistida (DEC-077).
export async function notifyClientOfEvent(
  usuarioId: Types.ObjectId,
  collectionId: Types.ObjectId,
  event: CollectionEvent,
): Promise<void> {
  try {
    await Notification.create({
      usuarioId,
      ...CLIENT_NOTIFICATIONS[event],
      referencia: { tipo: "COLETA", id: collectionId },
    });
  } catch (error) {
    console.error(
      `[backend] Falha ao registrar notificação (${event}, coleta ${String(collectionId)}):`,
      error instanceof Error ? error.message : error,
    );
  }
}

// Representação da notificação (06_API §24, 07 §37).
export type NotificationView = {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  referencia: { tipo: string; id: string } | null;
  lida: boolean;
  createdAt: Date;
};

type NotificationRecord = {
  _id: Types.ObjectId;
  tipo: string;
  titulo: string;
  mensagem: string;
  referencia?: { tipo: string; id: Types.ObjectId } | null;
  lida: boolean;
  createdAt: Date;
};

function toView(record: NotificationRecord): NotificationView {
  return {
    id: String(record._id),
    tipo: record.tipo,
    titulo: record.titulo,
    mensagem: record.mensagem,
    referencia: record.referencia ? { tipo: record.referencia.tipo, id: String(record.referencia.id) } : null,
    lida: record.lida,
    createdAt: record.createdAt,
  };
}

// Somente as notificações do usuário autenticado (RF-048), mais recentes
// primeiro. `lida=false` filtra as não lidas; com limit=1, o total é o
// contador usado pelo frontend (DEC-077).
export async function listNotifications(
  usuarioId: string,
  query: NotificationsQuery,
): Promise<Paginated<NotificationView>> {
  const filter = {
    usuarioId: new Types.ObjectId(usuarioId),
    ...(query.lida === undefined ? {} : { lida: query.lida }),
  };
  const [records, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return paginate((records as unknown as NotificationRecord[]).map(toView), total, query);
}

const notFound = () => new AppError(404, "RESOURCE_NOT_FOUND", "Notificação não encontrada.");

// Marca como lida (RF-049). Notificação de outro usuário responde 404, sem
// revelar que existe (06 §24.2, DEC-070). Repetir a operação não é erro.
export async function markNotificationAsRead(id: string, usuarioId: string): Promise<NotificationView> {
  if (!isValidObjectId(id)) throw notFound();

  const updated = await Notification.findOneAndUpdate(
    { _id: new Types.ObjectId(id), usuarioId: new Types.ObjectId(usuarioId) },
    { $set: { lida: true } },
    { returnDocument: "after" },
  ).lean();

  if (!updated) throw notFound();
  return toView(updated as unknown as NotificationRecord);
}
