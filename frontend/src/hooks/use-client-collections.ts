"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCollection,
  getMyCollection,
  listMyCollections,
  type ClientCollection,
  type CreateCollectionPayload,
} from "@/lib/api/collections";

// Chaves de cache das coletas do cliente.
export const clientCollectionKeys = {
  all: ["collections", "client"] as const,
  list: (page: number, limit: number) => [...clientCollectionKeys.all, "list", page, limit] as const,
  detail: (id: string) => [...clientCollectionKeys.all, "detail", id] as const,
};

export function useMyCollections(page: number, limit = 10) {
  return useQuery({
    queryKey: clientCollectionKeys.list(page, limit),
    queryFn: ({ signal }) => listMyCollections(page, limit, signal),
    // Mantém a página anterior visível enquanto a próxima carrega.
    placeholderData: keepPreviousData,
  });
}

export function useMyCollection(id: string) {
  return useQuery({
    queryKey: clientCollectionKeys.detail(id),
    queryFn: ({ signal }) => getMyCollection(id, signal),
  });
}

// Criação de coleta: invalida as listas e já guarda o detalhe da nova coleta (11 §96).
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCollectionPayload) => createCollection(payload),
    onSuccess: (collection: ClientCollection) => {
      queryClient.setQueryData(clientCollectionKeys.detail(collection.id), collection);
      return queryClient.invalidateQueries({ queryKey: [...clientCollectionKeys.all, "list"] });
    },
  });
}
