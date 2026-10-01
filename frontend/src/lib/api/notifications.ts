import { apiRequest } from "./client";
import type { Paginated } from "./collections";

// Notificação do usuário autenticado (06_API §24, DEC-077).
export type AppNotification = {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  referencia: { tipo: string; id: string } | null;
  lida: boolean;
  createdAt: string;
};

export async function listNotifications(
  page: number,
  limit: number,
  options: { unreadOnly?: boolean; signal?: AbortSignal } = {},
) {
  const filter = options.unreadOnly ? "&lida=false" : "";
  const { data } = await apiRequest<Paginated<AppNotification>>(`/notifications?page=${page}&limit=${limit}${filter}`, {
    signal: options.signal,
  });
  return data;
}

export async function markNotificationAsRead(id: string): Promise<AppNotification> {
  const { data } = await apiRequest<{ notification: AppNotification }>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
  return data.notification;
}
