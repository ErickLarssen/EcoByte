import { apiRequest } from "./client";

// Endereço de um CEP (DEC-081). `atendido`: dentro de Diadema-SP.
export type CepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  atendido: boolean;
};

export async function lookupCep(cep: string, signal?: AbortSignal): Promise<CepAddress> {
  const { data } = await apiRequest<{ address: CepAddress }>(`/cep/${encodeURIComponent(cep)}`, { signal });
  return data.address;
}
