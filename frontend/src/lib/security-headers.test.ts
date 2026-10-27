import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, staticSecurityHeaders } from "./security-headers";

const directive = (policy: string, name: string) => policy.split("; ").find((item) => item.startsWith(`${name} `));

describe("Content-Security-Policy (DEC-091)", () => {
  it("em produção, só executa scripts com o nonce da requisição", () => {
    const policy = buildContentSecurityPolicy("abc123", false);

    expect(directive(policy, "script-src")).toBe("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(policy).not.toContain("unsafe-eval");
    expect(directive(policy, "script-src")).not.toContain("unsafe-inline");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("não libera nenhum domínio externo", () => {
    expect(buildContentSecurityPolicy("n", false)).not.toMatch(/https?:|\*/);
  });

  it("em desenvolvimento, permite eval do React e o WebSocket do recarregamento", () => {
    const policy = buildContentSecurityPolicy("n", true);

    expect(directive(policy, "script-src")).toContain("'unsafe-eval'");
    expect(directive(policy, "connect-src")).toBe("connect-src 'self' ws: wss:");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });
});

describe("cabeçalhos fixos (DEC-091)", () => {
  const keys = (production: boolean) => staticSecurityHeaders(production).map((header) => header.key);

  it("HSTS só em produção", () => {
    expect(keys(true)).toContain("Strict-Transport-Security");
    expect(keys(false)).not.toContain("Strict-Transport-Security");
  });

  it("desliga recursos do navegador que o EcoByte não usa", () => {
    const permissions = staticSecurityHeaders(true).find((header) => header.key === "Permissions-Policy")?.value;
    expect(permissions).toContain("camera=()");
    expect(permissions).toContain("geolocation=()");
  });
});
