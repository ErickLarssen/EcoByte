import type { RecordStatus } from "./admin";
import { apiRequest } from "./client";
import type { GeoPoint } from "./collections";

export type EcopointAddress = {
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

// Ecoponto central (06_API §12.1, DEC-076).
export type Ecopoint = {
  id: string;
  nome: string;
  descricao: string | null;
  endereco: EcopointAddress;
  localizacao: GeoPoint | null;
  // Formato em aberto (OQ-005): a interface não interpreta o conteúdo.
  horarios: unknown[];
  status: RecordStatus;
  updatedAt: string;
};

// Alteração parcial (DEC-065). `horarios` não faz parte do contrato (OQ-005).
export type UpdateEcopointPayload = Partial<{
  nome: string;
  descricao: string | null;
  endereco: Omit<EcopointAddress, "complemento"> & { complemento?: string };
  localizacao: GeoPoint | null;
  status: RecordStatus;
}>;

// Consulta pública: não depende de sessão.
export async function getEcopoint(signal?: AbortSignal): Promise<Ecopoint> {
  const { data } = await apiRequest<{ ecopoint: Ecopoint }>("/ecopoint", { signal });
  return data.ecopoint;
}

export async function updateEcopoint(payload: UpdateEcopointPayload): Promise<Ecopoint> {
  const { data } = await apiRequest<{ ecopoint: Ecopoint }>("/ecopoint", { method: "PATCH", body: payload });
  return data.ecopoint;
}
