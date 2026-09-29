import type { CollectionStatus } from "@/lib/collection-status";
import { apiRequest } from "./client";

export type GeoPoint = { type: "Point"; coordinates: [number, number] };

export type EnderecoColeta = {
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  localizacao: GeoPoint | null;
};

export type ItemDescarte = {
  categoria: string;
  quantidade: number;
  condicao: string;
};

// Campos comuns às visões do cliente e do coletor (06_API §13.4).
export type CollectionBase = {
  id: string;
  status: CollectionStatus;
  enderecoColeta: EnderecoColeta;
  itensDescarte: ItemDescarte[];
  dataAgendada: string | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  collectedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
};

// Visão do cliente: nome do coletor responsável (DEC-070).
export type ClientCollection = CollectionBase & { coletor: { nome: string } | null };

// Visão do coletor: nome e telefone do cliente somente nas coletas atribuídas
// a ele; em coletas PENDENTE, `cliente` é null (DEC-070).
export type CollectorCollection = CollectionBase & {
  cliente: { nome: string; telefone: string | null } | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Paginated<T> = { items: T[]; pagination: Pagination };

// Corpo de criação (06_API §13.1). `dataAgendada` não é enviado (OQ-020).
export type CreateCollectionPayload = {
  enderecoColeta: Omit<EnderecoColeta, "complemento" | "localizacao"> & { complemento?: string };
  itensDescarte: ItemDescarte[];
  observacoes?: string;
};

export async function createCollection(payload: CreateCollectionPayload): Promise<ClientCollection> {
  const { data } = await apiRequest<{ collection: ClientCollection }>("/collections", {
    method: "POST",
    body: payload,
  });
  return data.collection;
}

export async function listMyCollections(page: number, limit: number, signal?: AbortSignal) {
  const { data } = await apiRequest<Paginated<ClientCollection>>(`/collections?page=${page}&limit=${limit}`, { signal });
  return data;
}

export async function getMyCollection(id: string, signal?: AbortSignal): Promise<ClientCollection> {
  const { data } = await apiRequest<{ collection: ClientCollection }>(`/collections/${encodeURIComponent(id)}`, {
    signal,
  });
  return data.collection;
}

// ---------------------------------------------------------------------------
// Coletor (13 §69, DEC-064)
// ---------------------------------------------------------------------------

// Cada evento do coletor é um endpoint de ação (DEC-041, DEC-064).
export type CollectorEvent = "accept" | "start" | "collect" | "deliver" | "complete";

export async function listAvailableCollections(page: number, limit: number, signal?: AbortSignal) {
  const { data } = await apiRequest<Paginated<CollectorCollection>>(
    `/collections/available?page=${page}&limit=${limit}`,
    { signal },
  );
  return data;
}

export async function listAssignedCollections(page: number, limit: number, signal?: AbortSignal) {
  const { data } = await apiRequest<Paginated<CollectorCollection>>(
    `/collections/assigned?page=${page}&limit=${limit}`,
    { signal },
  );
  return data;
}

export async function getCollectorCollection(id: string, signal?: AbortSignal): Promise<CollectorCollection> {
  const { data } = await apiRequest<{ collection: CollectorCollection }>(`/collections/${encodeURIComponent(id)}`, {
    signal,
  });
  return data.collection;
}

// A mensagem de sucesso vem da API (ex.: "Coleta aceita.").
export async function runCollectorEvent(id: string, event: CollectorEvent) {
  const { data, message } = await apiRequest<{ collection: CollectorCollection }>(
    `/collections/${encodeURIComponent(id)}/${event}`,
    { method: "POST" },
  );
  return { collection: data.collection, message };
}
