"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCollectorCollection,
  listAssignedCollections,
  listAvailableCollections,
  runCollectorEvent,
  type CollectorEvent,
} from "@/lib/api/collections";

// Chaves de cache das coletas do coletor.
export const collectorCollectionKeys = {
  all: ["collections", "collector"] as const,
  lists: () => [...collectorCollectionKeys.all, "list"] as const,
  available: (page: number, limit: number) => [...collectorCollectionKeys.lists(), "available", page, limit] as const,
  assigned: (page: number, limit: number) => [...collectorCollectionKeys.lists(), "assigned", page, limit] as const,
  detail: (id: string) => [...collectorCollectionKeys.all, "detail", id] as const,
};

export function useAvailableCollections(page: number, limit = 10) {
  return useQuery({
    queryKey: collectorCollectionKeys.available(page, limit),
    queryFn: ({ signal }) => listAvailableCollections(page, limit, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAssignedCollections(page: number, limit = 10) {
  return useQuery({
    queryKey: collectorCollectionKeys.assigned(page, limit),
    queryFn: ({ signal }) => listAssignedCollections(page, limit, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCollectorCollection(id: string) {
  return useQuery({
    queryKey: collectorCollectionKeys.detail(id),
    queryFn: ({ signal }) => getCollectorCollection(id, signal),
  });
}

// Ação do coletor sobre uma coleta (13 §72). A UI só muda depois da resposta
// da API (13 §76). Sucesso ou recusa: as listas são invalidadas, para que a
// coleta saia de "disponíveis" e apareça em "minhas coletas" (13 §73, §60).
export function useCollectorEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: CollectorEvent) => runCollectorEvent(id, event),
    onSuccess: ({ collection }) => {
      queryClient.setQueryData(collectorCollectionKeys.detail(id), collection);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: collectorCollectionKeys.lists() }),
  });
}
