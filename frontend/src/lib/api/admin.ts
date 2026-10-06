import type { CollectionStatus } from "@/lib/collection-status";
import type { TipoCadastro, UserRole } from "./auth";
import { apiRequest } from "./client";
import type { CollectionBase, Paginated } from "./collections";

export type RecordStatus = "ATIVO" | "INATIVO";

// Usuário na visão administrativa (06_API §22, DEC-075). Sem senha nem documento.
export type AdminUser = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role: UserRole;
  tipoCadastro: TipoCadastro;
  dadosEmpresa: { razaoSocial: string | null; nomeFantasia: string | null } | null;
  status: RecordStatus;
  // Senha provisória ainda não trocada pelo coletor (DEC-083).
  trocaSenhaObrigatoria: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserRef = { id: string; nome: string; email: string; telefone: string | null };

// Coleta na visão administrativa (06_API §23, DEC-075).
export type AdminCollection = CollectionBase & { cliente: AdminUserRef | null; coletor: AdminUserRef | null };

export async function listUsers(page: number, limit: number, signal?: AbortSignal) {
  const { data } = await apiRequest<Paginated<AdminUser>>(`/admin/users?page=${page}&limit=${limit}`, { signal });
  return data;
}

export async function getUser(id: string, signal?: AbortSignal): Promise<AdminUser> {
  const { data } = await apiRequest<{ user: AdminUser }>(`/admin/users/${encodeURIComponent(id)}`, { signal });
  return data.user;
}

// A mensagem de sucesso vem da API ("Usuário ativado." / "Usuário desativado.").
export async function updateUserStatus(id: string, status: RecordStatus) {
  const { data, message } = await apiRequest<{ user: AdminUser }>(`/admin/users/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
  return { user: data.user, message };
}

export async function listAdminCollections(
  page: number,
  limit: number,
  status: CollectionStatus | null,
  signal?: AbortSignal,
) {
  const filter = status ? `&status=${status}` : "";
  const { data } = await apiRequest<Paginated<AdminCollection>>(
    `/admin/collections?page=${page}&limit=${limit}${filter}`,
    { signal },
  );
  return data;
}

export async function getAdminCollection(id: string, signal?: AbortSignal): Promise<AdminCollection> {
  const { data } = await apiRequest<{ collection: AdminCollection }>(`/admin/collections/${encodeURIComponent(id)}`, {
    signal,
  });
  return data.collection;
}

// Cadastro de coletor pelo administrador (DEC-083), com senha provisória.
export type CreateCollectorPayload = {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmacaoSenha: string;
};

export async function createCollector(payload: CreateCollectorPayload): Promise<AdminUser> {
  const { data } = await apiRequest<{ user: AdminUser }>("/admin/users", { method: "POST", body: payload });
  return data.user;
}
