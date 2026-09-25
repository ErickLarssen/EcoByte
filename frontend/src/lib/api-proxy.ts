// Proxy da API (DEC-063): o navegador acessa somente a origem do frontend
// e o Next.js encaminha /api/v1/* ao Express. É somente roteamento —
// autenticação, autorização e regras de negócio ficam no backend.

export type Rewrite = {
  source: string;
  destination: string;
};

// Porta padrão do backend em desenvolvimento (docs/18_DEVELOPMENT.md §6.1).
export const DEVELOPMENT_API_URL = "http://localhost:4000";

// Em produção a URL é obrigatória; fora dela, usa o backend local.
// Os rewrites são avaliados no build, então API_INTERNAL_URL precisa
// estar definida no momento do `next build` de produção.
export function resolveApiInternalUrl(env: {
  API_INTERNAL_URL?: string;
  NODE_ENV?: string;
}): string | undefined {
  if (env.API_INTERNAL_URL) {
    return env.API_INTERNAL_URL;
  }

  return env.NODE_ENV === "production" ? undefined : DEVELOPMENT_API_URL;
}

export function buildApiRewrites(apiInternalUrl: string | undefined): Rewrite[] {
  if (!apiInternalUrl) {
    throw new Error("API_INTERNAL_URL é obrigatória para o proxy da API (DEC-063).");
  }

  const url = new URL(apiInternalUrl);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("API_INTERNAL_URL deve utilizar http:// ou https://.");
  }

  return [
    {
      source: "/api/v1/:path*",
      destination: `${url.origin}/api/v1/:path*`,
    },
  ];
}
