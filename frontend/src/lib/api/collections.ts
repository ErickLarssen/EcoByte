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

// Visão do cliente (06_API §13.4).
export type ClientCollection = {
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
  coletor: { nome: string } | null;
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
