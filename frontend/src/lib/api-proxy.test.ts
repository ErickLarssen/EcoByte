import { describe, expect, it } from "vitest";
import { buildApiRewrites, DEVELOPMENT_API_URL, resolveApiInternalUrl } from "./api-proxy";

describe("resolveApiInternalUrl", () => {
  it("usa API_INTERNAL_URL quando definida", () => {
    expect(resolveApiInternalUrl({ API_INTERNAL_URL: "http://api:4000", NODE_ENV: "production" })).toBe(
      "http://api:4000",
    );
  });

  it("usa o backend local fora de produção", () => {
    expect(resolveApiInternalUrl({ NODE_ENV: "development" })).toBe(DEVELOPMENT_API_URL);
    expect(resolveApiInternalUrl({})).toBe(DEVELOPMENT_API_URL);
  });

  it("não assume valor padrão em produção", () => {
    expect(resolveApiInternalUrl({ NODE_ENV: "production" })).toBeUndefined();
  });
});

describe("buildApiRewrites", () => {
  it("encaminha /api/v1/* para o backend", () => {
    expect(buildApiRewrites("http://localhost:4000")).toEqual([
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:4000/api/v1/:path*",
      },
    ]);
  });

  it("ignora caminho e barra final da URL configurada", () => {
    const [rewrite] = buildApiRewrites("http://backend-interno:4000/qualquer/");

    expect(rewrite?.destination).toBe("http://backend-interno:4000/api/v1/:path*");
  });

  it("interrompe quando API_INTERNAL_URL está ausente", () => {
    expect(() => buildApiRewrites(undefined)).toThrow(/API_INTERNAL_URL/);
  });

  it("interrompe quando API_INTERNAL_URL não é uma URL válida", () => {
    expect(() => buildApiRewrites("localhost:4000")).toThrow();
  });
});
