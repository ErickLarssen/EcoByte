"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCollector,
  getAdminCollection,
  getUser,
  listAdminCollections,
  listUsers,
  updateUserStatus,
  type CreateCollectorPayload,
  type RecordStatus,
} from "@/lib/api/admin";
import type { CollectionStatus } from "@/lib/collection-status";

// Chaves de cache da área administrativa.
export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  userList: (page: number, limit: number) => [...adminKeys.users(), "list", page, limit] as const,
  user: (id: string) => [...adminKeys.users(), "detail", id] as const,
  collections: () => [...adminKeys.all, "collections"] as const,
  collectionList: (page: number, limit: number, status: CollectionStatus | null) =>
    [...adminKeys.collections(), "list", page, limit, status] as const,
  collection: (id: string) => [...adminKeys.collections(), "detail", id] as const,
};

export function useAdminUsers(page: number, limit = 10) {
  return useQuery({
    queryKey: adminKeys.userList(page, limit),
    queryFn: ({ signal }) => listUsers(page, limit, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string) {
  return useQuery({ queryKey: adminKeys.user(id), queryFn: ({ signal }) => getUser(id, signal) });
}

// Ativar/desativar: a tela só muda após a resposta da API; a lista de
// usuários é invalidada para refletir o novo status.
export function useUpdateUserStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: RecordStatus) => updateUserStatus(id, status),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(adminKeys.user(id), user);
      return queryClient.invalidateQueries({ queryKey: [...adminKeys.users(), "list"] });
    },
  });
}

export function useAdminCollections(page: number, status: CollectionStatus | null, limit = 10) {
  return useQuery({
    queryKey: adminKeys.collectionList(page, limit, status),
    queryFn: ({ signal }) => listAdminCollections(page, limit, status, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCollection(id: string) {
  return useQuery({ queryKey: adminKeys.collection(id), queryFn: ({ signal }) => getAdminCollection(id, signal) });
}

// Cadastro de coletor (DEC-083): guarda o detalhe e atualiza a lista de usuários.
export function useCreateCollector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCollectorPayload) => createCollector(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(adminKeys.user(user.id), user);
      return queryClient.invalidateQueries({ queryKey: [...adminKeys.users(), "list"] });
    },
  });
}
