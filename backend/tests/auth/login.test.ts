import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { VALID_PASSWORD, createUser, sessionCookie } from "../helpers/auth.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const EMAIL = "cliente@teste.local";
const login = (body: unknown) => request(createTestApp()).post("/api/v1/auth/login").send(body as object);

describe("POST /api/v1/auth/login (17_TESTING §30, §41)", () => {
  beforeEach(async () => {
    await createUser({ email: EMAIL });
  });

  it("autentica com credenciais válidas: 200, usuário público e cookie de sessão", async () => {
    const response = await login({ email: EMAIL, senha: VALID_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login realizado com sucesso.");
    expect(response.body.data.user).toMatchObject({ email: EMAIL, role: "CLIENTE", status: "ATIVO" });
    expect(response.body.data.user).not.toHaveProperty("senhaHash");

    const cookie = sessionCookie(response.headers["set-cookie"]);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).not.toMatch(/Secure/);
  });

  it("aceita e-mail com maiúsculas", async () => {
    const response = await login({ email: "Cliente@Teste.LOCAL", senha: VALID_PASSWORD });

    expect(response.status).toBe(200);
  });

  it("rejeita senha incorreta com 401 e mensagem genérica", async () => {
    const response = await login({ email: EMAIL, senha: "Errada@123" });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(response.body.message).toBe("Credenciais inválidas.");
    expect(sessionCookie(response.headers["set-cookie"])).toBeUndefined();
  });

  it("responde e-mail inexistente exatamente como senha incorreta (17_TESTING §109)", async () => {
    const wrongPassword = await login({ email: EMAIL, senha: "Errada@123" });
    const unknownEmail = await login({ email: "ninguem@teste.local", senha: "Errada@123" });

    expect(unknownEmail.status).toBe(wrongPassword.status);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it("rejeita usuário inativo com 403 somente após senha correta", async () => {
    await createUser({ email: "inativo@teste.local", status: "INATIVO" });

    const correct = await login({ email: "inativo@teste.local", senha: VALID_PASSWORD });
    const wrong = await login({ email: "inativo@teste.local", senha: "Errada@123" });

    expect(correct.status).toBe(403);
    expect(correct.body.error.code).toBe("USER_INACTIVE");
    expect(sessionCookie(correct.headers["set-cookie"])).toBeUndefined();
    expect(wrong.status).toBe(401);
    expect(wrong.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejeita dados incompletos com 400", async () => {
    const response = await login({ email: EMAIL });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual({ code: "VALIDATION_ERROR", fields: { senha: "Informe a senha." } });
  });

  it("gera um novo identificador de sessão a cada login (09 §20)", async () => {
    const app = createTestApp();
    const agent = request.agent(app);

    const first = await agent.post("/api/v1/auth/login").send({ email: EMAIL, senha: VALID_PASSWORD });
    const second = await agent.post("/api/v1/auth/login").send({ email: EMAIL, senha: VALID_PASSWORD });

    const firstId = sessionCookie(first.headers["set-cookie"])?.split(";")[0];
    const secondId = sessionCookie(second.headers["set-cookie"])?.split(";")[0];

    expect(firstId).toBeDefined();
    expect(secondId).toBeDefined();
    expect(secondId).not.toBe(firstId);
  });
});
