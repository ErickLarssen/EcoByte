import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { User } from "../../src/models/index.js";
import { createUser, loginAgent, sessionCookie } from "../helpers/auth.js";
import { TEST_SESSION_MAX_AGE, createMongoSessionStore, createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const EMAIL = "cliente@teste.local";

describe("GET /api/v1/auth/me (17_TESTING §32)", () => {
  it("retorna o usuário da sessão válida", async () => {
    await createUser({ email: EMAIL });
    const agent = await loginAgent(createTestApp(), EMAIL);

    const response = await agent.get("/api/v1/auth/me");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "Usuário autenticado.",
      data: {
        user: {
          id: expect.any(String),
          nome: "Usuário CLIENTE",
          email: EMAIL,
          role: "CLIENTE",
          tipoCadastro: "PF",
          status: "ATIVO",
        },
      },
    });
  });

  it("retorna 401 sem sessão", async () => {
    const response = await request(createTestApp()).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("retorna 401 com cookie de sessão inválido ou adulterado", async () => {
    const response = await request(createTestApp())
      .get("/api/v1/auth/me")
      .set("Cookie", "ecobyte.sid=s%3Aforjado.assinatura-invalida");

    expect(response.status).toBe(401);
  });

  it("encerra a sessão e retorna 403 quando o usuário é desativado (06_API §27.3)", async () => {
    const user = await createUser({ email: EMAIL });
    const agent = await loginAgent(createTestApp(), EMAIL);

    await User.updateOne({ _id: user._id }, { status: "INATIVO" });
    const blocked = await agent.get("/api/v1/auth/me");

    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe("USER_INACTIVE");

    // Mesmo reativado, a sessão antiga não volta a valer.
    await User.updateOne({ _id: user._id }, { status: "ATIVO" });
    const afterReactivation = await agent.get("/api/v1/auth/me");
    expect(afterReactivation.status).toBe(401);
  });

  it("encerra a sessão quando o usuário não existe mais", async () => {
    const user = await createUser({ email: EMAIL });
    const agent = await loginAgent(createTestApp(), EMAIL);

    await User.deleteOne({ _id: user._id });

    expect((await agent.get("/api/v1/auth/me")).status).toBe(401);
  });

  it("reflete mudança de role imediatamente, sem novo login", async () => {
    const user = await createUser({ email: EMAIL });
    const agent = await loginAgent(createTestApp(), EMAIL);

    await User.updateOne({ _id: user._id }, { role: "COLETOR" });

    expect((await agent.get("/api/v1/auth/me")).body.data.user.role).toBe("COLETOR");
  });
});

describe("POST /api/v1/auth/logout (17_TESTING §31)", () => {
  it("invalida a sessão: rota protegida volta a responder 401", async () => {
    await createUser({ email: EMAIL });
    const agent = await loginAgent(createTestApp(), EMAIL);

    const response = await agent.post("/api/v1/auth/logout");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "success", message: "Logout realizado com sucesso.", data: null });
    expect((await agent.get("/api/v1/auth/me")).status).toBe(401);
  });

  it("não aceita reutilizar o cookie antigo após o logout", async () => {
    await createUser({ email: EMAIL });
    const app = createTestApp();
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: EMAIL, senha: "Senha@123" });
    const oldCookie = sessionCookie(loginResponse.headers["set-cookie"])!.split(";")[0]!;

    await request(app).post("/api/v1/auth/logout").set("Cookie", oldCookie).expect(200);
    const reuse = await request(app).get("/api/v1/auth/me").set("Cookie", oldCookie);

    expect(reuse.status).toBe(401);
  });

  it("exige autenticação", async () => {
    const response = await request(createTestApp()).post("/api/v1/auth/logout");

    expect(response.status).toBe(401);
  });
});

describe("store de sessões no MongoDB (DEC-021)", () => {
  it("persiste a sessão na coleção sessions e a remove no logout", async () => {
    await createUser({ email: EMAIL });
    const app = createTestApp({ session: { store: createMongoSessionStore() } });
    const sessions = () => mongoose.connection.db!.collection("sessions");

    const agent = await loginAgent(app, EMAIL);
    const stored = await sessions().find().toArray();

    expect(stored).toHaveLength(1);
    expect(JSON.stringify(stored[0])).toContain("userId");
    expect(JSON.stringify(stored[0])).not.toContain("senha");

    expect((await agent.get("/api/v1/auth/me")).status).toBe(200);

    await agent.post("/api/v1/auth/logout").expect(200);
    expect(await sessions().countDocuments()).toBe(0);
  });

  it("não cria sessão para visitantes anônimos", async () => {
    const app = createTestApp({ session: { store: createMongoSessionStore() } });

    await request(app).get("/api/v1/health").expect(200);
    await request(app).get("/api/v1/auth/me").expect(401);

    expect(await mongoose.connection.db!.collection("sessions").countDocuments()).toBe(0);
  });
});

describe("cookie de sessão", () => {
  it("expira em 7 dias e é renovado a cada requisição autenticada (DEC-021)", async () => {
    await createUser({ email: EMAIL });
    const agent = await loginAgent(createTestApp(), EMAIL);

    const response = await agent.get("/api/v1/auth/me");
    const cookie = sessionCookie(response.headers["set-cookie"]);

    expect(cookie).toBeDefined();
    const expires = new Date(/Expires=([^;]+)/.exec(cookie!)![1]!).getTime();
    const expected = Date.now() + TEST_SESSION_MAX_AGE * 1000;
    expect(Math.abs(expires - expected)).toBeLessThan(5_000);
  });

  it("é Secure quando secureCookies está ativo e a conexão original é HTTPS (DEC-068)", async () => {
    await createUser({ email: EMAIL });
    const app = createTestApp({ trustProxy: 1, session: { secureCookies: true } });

    const response = await request(app)
      .post("/api/v1/auth/login")
      .set("X-Forwarded-Proto", "https")
      .send({ email: EMAIL, senha: "Senha@123" });

    expect(response.status).toBe(200);
    expect(sessionCookie(response.headers["set-cookie"])).toMatch(/Secure/);
  });
});
