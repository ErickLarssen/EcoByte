import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import { AuthProvider } from "@/components/features/auth/auth-provider";
import type { AdminCollection, AdminUser } from "@/lib/api/admin";
import type { ClientCollection, CollectorCollection } from "@/lib/api/collections";

type Envelope = { status: number; body: unknown };

export function success<T>(data: T, message = "OK", status = 200): Envelope {
  return { status, body: { status: "success", message, data } };
}

export function failure(status: number, code: string, message: string, fields: Record<string, string> = {}): Envelope {
  return { status, body: { status: "error", message, error: { code, fields }, data: null } };
}

type Route = { method?: string; path: string; response: Envelope | ((body: unknown) => Envelope) };

// Substitui o fetch global por respostas no envelope da API (DEC-017),
// registrando as chamadas feitas.
export function mockApi(routes: Route[]) {
  const calls: Array<{ method: string; path: string; body: unknown }> = [];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, path: url, body });

    const route = routes.find((item) => (item.method ?? "GET") === method && `/api/v1${item.path}` === url);
    const envelope = route
      ? typeof route.response === "function"
        ? route.response(body)
        : route.response
      : failure(404, "RESOURCE_NOT_FOUND", "Recurso não encontrado.");

    return new Response(JSON.stringify(envelope.body), {
      status: envelope.status,
      headers: { "Content-Type": "application/json" },
    });
  });

  vi.stubGlobal("fetch", fetchMock);
  return { calls, fetchMock };
}

// Um QueryClient novo por teste, sem novas tentativas, para isolar o cache.
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

export function renderWithAuth(ui: ReactElement, queryClient = createTestQueryClient()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>,
  );
}

export function renderWithQuery(ui: ReactElement, queryClient = createTestQueryClient()) {
  return { queryClient, ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>) };
}

type CollectionOverrides = Partial<ClientCollection>;

// Coleta na visão do cliente (06_API §13.4), para testes.
export function buildCollection(overrides: CollectionOverrides = {}): ClientCollection {
  return {
    id: "c1",
    status: "PENDENTE",
    enderecoColeta: {
      logradouro: "Rua das Palmeiras",
      numero: "120",
      complemento: "Casa 2",
      bairro: "Centro",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900001",
      localizacao: null,
    },
    itensDescarte: [
      { categoria: "INFORMATICA", quantidade: 2, condicao: "USADO" },
      { categoria: "CELULARES", quantidade: 1, condicao: "DANIFICADO" },
    ],
    dataAgendada: null,
    observacoes: null,
    createdAt: "2026-09-20T13:00:00.000Z",
    updatedAt: "2026-09-20T13:00:00.000Z",
    acceptedAt: null,
    startedAt: null,
    collectedAt: null,
    deliveredAt: null,
    completedAt: null,
    coletor: null,
    ...overrides,
  };
}

export function paginated<T>(items: T[], page = 1, limit = 10, total = items.length) {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
  };
}

export const clienteUser = {
  id: "u1",
  nome: "Mariana Oliveira",
  email: "mariana@ecobyte.local",
  role: "CLIENTE" as const,
  tipoCadastro: "PF" as const,
  status: "ATIVO" as const,
  emailVerificado: true,
};

// Coleta na visão do coletor (06_API §13.4, DEC-070): `cliente` é null em
// coletas PENDENTE e preenchido nas atribuídas ao coletor.
export function buildCollectorCollection(overrides: Partial<CollectorCollection> = {}): CollectorCollection {
  const base: Partial<ClientCollection> = buildCollection();
  delete base.coletor;
  return { ...(base as Omit<ClientCollection, "coletor">), cliente: null, ...overrides };
}

export const coletorUser = {
  id: "k1",
  nome: "Carlos Mendes",
  email: "carlos@ecobyte.local",
  role: "COLETOR" as const,
  tipoCadastro: "PF" as const,
  status: "ATIVO" as const,
  emailVerificado: true,
};

// Usuário na visão administrativa (DEC-075), para testes.
export function buildAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "u1",
    nome: "Mariana Oliveira",
    email: "mariana@ecobyte.local",
    telefone: "11987654321",
    role: "CLIENTE",
    tipoCadastro: "PF",
    dadosEmpresa: null,
    status: "ATIVO",
    createdAt: "2026-09-20T13:00:00.000Z",
    updatedAt: "2026-09-20T13:00:00.000Z",
    ...overrides,
  };
}

// Coleta na visão administrativa (DEC-075), para testes.
export function buildAdminCollection(overrides: Partial<AdminCollection> = {}): AdminCollection {
  const base: Partial<ClientCollection> = buildCollection();
  delete base.coletor;
  return {
    ...(base as Omit<ClientCollection, "coletor">),
    cliente: { id: "u1", nome: "Mariana Oliveira", email: "mariana@ecobyte.local", telefone: "11987654321" },
    coletor: null,
    ...overrides,
  };
}

export const adminUser = {
  id: "a1",
  nome: "Ana Admin",
  email: "admin@ecobyte.local",
  role: "ADMIN" as const,
  tipoCadastro: "PF" as const,
  status: "ATIVO" as const,
  emailVerificado: true,
};
