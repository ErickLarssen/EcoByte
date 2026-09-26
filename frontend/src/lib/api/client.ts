// Cliente HTTP único da aplicação (11 §98). O navegador fala somente com a
// própria origem; o Next.js encaminha /api/v1/* ao Express (DEC-063).

export const API_BASE_PATH = "/api/v1";

export type FieldErrors = Record<string, string>;

// Erro da API no envelope padronizado (DEC-017).
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: FieldErrors;

  constructor(status: number, code: string, message: string, fields: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type SuccessEnvelope<T> = { status: "success"; message: string; data: T };
type ErrorEnvelope = { status: "error"; message: string; error: { code: string; fields?: FieldErrors }; data: null };

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

const GENERIC_ERROR = "Não foi possível realizar a operação. Tente novamente.";

function isEnvelope(value: unknown): value is SuccessEnvelope<unknown> | ErrorEnvelope {
  return typeof value === "object" && value !== null && "status" in value && "message" in value;
}

export async function apiRequest<T>(path: string, { method = "GET", body, signal }: RequestOptions = {}) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_PATH}${path}`, {
      method,
      signal,
      // O cookie de sessão é first-party (DEC-021, DEC-063).
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "NETWORK_ERROR", "Não foi possível conectar ao servidor. Verifique sua conexão.");
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!isEnvelope(payload)) {
    throw new ApiError(response.status, "UNEXPECTED_RESPONSE", GENERIC_ERROR);
  }

  if (payload.status === "error" || !response.ok) {
    const error = payload.status === "error" ? payload.error : undefined;
    throw new ApiError(response.status, error?.code ?? "UNEXPECTED_RESPONSE", payload.message || GENERIC_ERROR, error?.fields ?? {});
  }

  return { data: payload.data as T, message: payload.message };
}
