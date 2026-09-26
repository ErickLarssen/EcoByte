import { describe, expect, it } from "vitest";
import { isSafeInternalPath, loginRedirectPath, postLoginDestination } from "./navigation";

describe("postLoginDestination (DEC-072)", () => {
  it("envia cada perfil à sua área quando não há página solicitada", () => {
    expect(postLoginDestination("CLIENTE", null)).toBe("/cliente");
    expect(postLoginDestination("COLETOR", null)).toBe("/coletor");
    expect(postLoginDestination("ADMIN", null)).toBe("/admin");
  });

  it("retorna à página solicitada quando ela pertence à área do perfil", () => {
    expect(postLoginDestination("CLIENTE", "/cliente/coletas/nova")).toBe("/cliente/coletas/nova");
    expect(postLoginDestination("COLETOR", "/coletor")).toBe("/coletor");
  });

  it("ignora página de outro perfil", () => {
    expect(postLoginDestination("CLIENTE", "/admin")).toBe("/cliente");
    expect(postLoginDestination("COLETOR", "/cliente/coletas")).toBe("/coletor");
  });

  it("não confunde prefixos parecidos (/clientes não é /cliente)", () => {
    expect(postLoginDestination("CLIENTE", "/clientes")).toBe("/cliente");
  });

  it.each(["https://malicioso.exemplo/cliente", "//malicioso.exemplo/cliente", "/\\malicioso.exemplo", "javascript:alert(1)"])(
    "bloqueia redirecionamento externo: %s",
    (requested) => {
      expect(isSafeInternalPath(requested)).toBe(false);
      expect(postLoginDestination("CLIENTE", requested)).toBe("/cliente");
    },
  );
});

describe("loginRedirectPath", () => {
  it("preserva a página atual codificada", () => {
    expect(loginRedirectPath("/cliente/coletas?page=2")).toBe("/entrar?proximo=%2Fcliente%2Fcoletas%3Fpage%3D2");
  });
});
