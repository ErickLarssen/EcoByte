"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listNotifications, markNotificationAsRead } from "@/lib/api/notifications";

// Consulta periódica do contador (OQ-012, DEC-077): a cada 60 s com a aba
// visível, e ao voltar para a aba (refetchOnWindowFocus, padrão do TanStack Query).
export const UNREAD_POLL_INTERVAL_MS = 60_000;

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (page: number, limit: number) => [...notificationKeys.all, "list", page, limit] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
};

export function useNotifications(page: number, limit = 10) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit),
    queryFn: ({ signal }) => listNotifications(page, limit, { signal }),
    placeholderData: keepPreviousData,
  });
}

// Total de não lidas: pedido com limit=1 e lida=false; o total da paginação é o contador.
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: ({ signal }) => listNotifications(1, 1, { unreadOnly: true, signal }),
    select: (data) => data.pagination.total,
    refetchInterval: UNREAD_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

// Marcar como lida: a lista e o contador são recarregados da API.
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
