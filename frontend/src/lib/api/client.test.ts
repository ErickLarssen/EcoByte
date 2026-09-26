import { describe, expect, it, vi } from "vitest";
import { failure, mockApi, success } from "@/test/utils";
import { ApiError, apiRequest } from "./client";

describe("apiRequest (11 §98)", () => {
  it("chama /api/v1 na mesma origem, com JSON e cookie de sessão", async () => {
    const { calls, fetchMock } = mockApi([{ method: "POST", path: "/auth/login", response: success({ ok: true }, "Feito.") }]);

    const result = await apiRequest("/auth/login", { method: "POST", body: { email: "a@b.com" } });

    expect(result).toEqual({ data: { ok: true }, message: "Feito." });
    expect(calls).toEqual([{ method: "POST", path: "/api/v1/auth/login", body: { email: "a@b.com" } }]);
    const init = fetchMock.mock.calls[0]![1]!;
    expect(init.credentials).toBe("same-origin");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json", Accept: "application/json" });
  });

  it("converte o envelope de erro em ApiError com status, código e campos", async () => {
    mockApi([
      {
        method: "POST",
        path: "/auth/register",
        response: failure(400, "VALIDATION_ERROR", "Existem campos inválidos.", { email: "Informe um e-mail válido." }),
      },
    ]);

    const error = await apiRequest("/auth/register", { method: "POST", body: {} }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Existem campos inválidos.",
      fields: { email: "Informe um e-mail válido." },
    });
  });

  it("trata falha de rede com mensagem própria", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(apiRequest("/auth/me")).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("trata resposta que não segue o envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>502</html>", { status: 502 })));

    await expect(apiRequest("/auth/me")).rejects.toMatchObject({ status: 502, code: "UNEXPECTED_RESPONSE" });
  });

  it("não envia Content-Type em requisições sem corpo", async () => {
    const { fetchMock } = mockApi([{ path: "/auth/me", response: success({}) }]);

    await apiRequest("/auth/me");

    expect(fetchMock.mock.calls[0]![1]!.headers).not.toHaveProperty("Content-Type");
  });
});
