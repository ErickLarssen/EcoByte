import { OUTSIDE_SERVICE_AREA_MESSAGE, isWithinServiceArea } from "../domain/service-area.js";
import { AppError } from "../utils/app-error.js";

// Endereço encontrado para um CEP (DEC-081). `atendido` indica se o CEP está
// na área de atendimento (Diadema-SP).
export type CepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  atendido: boolean;
};

// Consulta a um serviço externo de CEP; null quando o CEP não existe.
export type CepProvider = (cep: string) => Promise<Omit<CepAddress, "atendido"> | null>;

const TIMEOUT_MS = 5000;

type ViaCepResponse = { erro?: boolean | string; logradouro?: string; bairro?: string; localidade?: string; uf?: string };

// ViaCEP (https://viacep.com.br), serviço público e sem chave.
export function createViaCepProvider(baseUrl: string): CepProvider {
  return async (cep) => {
    const response = await fetch(`${baseUrl}/ws/${cep}/json/`, { signal: AbortSignal.timeout(TIMEOUT_MS) });

    if (response.status === 400) return null;
    if (!response.ok) throw new Error(`ViaCEP respondeu ${response.status}.`);

    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) return null;

    return {
      cep,
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      estado: data.uf ?? "",
    };
  };
}

export function normalizeCep(value: string): string | null {
  const digits = value.replace(/[\s.-]/g, "");
  return /^\d{8}$/.test(digits) ? digits : null;
}

// Busca o endereço do CEP. Falha do serviço externo responde 503, e o
// formulário segue com preenchimento manual.
export async function lookupCep(provider: CepProvider, value: string): Promise<CepAddress> {
  const cep = normalizeCep(value);

  if (!cep) {
    throw new AppError(400, "VALIDATION_ERROR", "Existem campos inválidos.", { cep: "O CEP deve ter 8 dígitos." });
  }

  let address: Awaited<ReturnType<CepProvider>>;
  try {
    address = await provider(cep);
  } catch (error) {
    console.error("[backend] Falha na consulta de CEP:", error instanceof Error ? error.message : error);
    throw new AppError(503, "CEP_SERVICE_UNAVAILABLE", "Não foi possível consultar o CEP agora. Preencha o endereço manualmente.");
  }

  if (!address) throw new AppError(404, "RESOURCE_NOT_FOUND", "CEP não encontrado.");

  return { ...address, atendido: isWithinServiceArea(address.cidade, address.estado) };
}

// Confere o CEP da coleta na área de atendimento (DEC-081). CEP inexistente ou
// de fora de Diadema-SP é recusado. Se o serviço externo falhar, a solicitação
// segue apenas com a validação de cidade e UF, para não depender dele.
export async function assertCepInServiceArea(provider: CepProvider, cep: string, field: string): Promise<void> {
  let address: Awaited<ReturnType<CepProvider>>;
  try {
    address = await provider(cep);
  } catch (error) {
    console.error("[backend] CEP não conferido (serviço indisponível):", error instanceof Error ? error.message : error);
    return;
  }

  if (!address) {
    throw new AppError(400, "VALIDATION_ERROR", "Existem campos inválidos.", { [field]: "CEP não encontrado." });
  }

  if (!isWithinServiceArea(address.cidade, address.estado)) {
    throw new AppError(400, "VALIDATION_ERROR", "Existem campos inválidos.", { [field]: OUTSIDE_SERVICE_AREA_MESSAGE });
  }
}
