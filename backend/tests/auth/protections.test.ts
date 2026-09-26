import express from "express";
import session from "express-session";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requireAuth } from "../../src/middlewares/authenticate.js";
import { requireRole } from "../../src/middlewares/authorize.js";
import { errorHandler } from "../../src/middlewares/error-handler.js";
import { createUser, loginAgent, validPF } from "../helpers/auth.js";
import { TEST_FRONTEND_URL, createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

describe("validação de Origin (DEC-069)", () => {
  it("rejeita POST de outra origem com 403 INVALID_ORIGIN", async () => {
    const response = await request(createTestApp())
      .post("/api/v1/auth/login")
      .set("Origin", "https://site-malicioso.exemplo")
      .send({ email: "a@b.com", senha: "x" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("INVALID_ORIGIN");
  });

  it("aceita POST da origem do frontend", async () => {
    const response = await request(createTestApp()).post("/api/v1/auth/register").set("Origin", TEST_FRONTEND_URL).send(validPF);

    expect(response.status).toBe(201);
  });

  it("aceita POST sem header Origin (cliente que não é navegador)", async () => {
    const response = await request(createTestApp()).post("/api/v1/auth/register").send(validPF);

    expect(response.status).toBe(201);
  });

  it("não bloqueia GET de outra origem", async () => {
    const response = await request(createTestApp()).get("/api/v1/health").set("Origin", "https://outro.exemplo");

    expect(response.status).toBe(200);
  });
});

describe("rate limiting (DEC-067, 17_TESTING §110)", () => {
  it("bloqueia a 11ª tentativa de login em 15 minutos com 429", async () => {
    const agent = request.agent(createTestApp());
    const attempt = () => agent.post("/api/v1/auth/login").send({ email: "x@teste.local", senha: "Errada@123" });

    for (let index = 0; index < 10; index += 1) {
      expect((await attempt()).status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      status: "error",
      message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      error: { code: "RATE_LIMIT_EXCEEDED", fields: {} },
      data: null,
    });
    expect(blocked.headers["retry-after"]).toBeDefined();
  });

  it("bloqueia o 6º cadastro em 1 hora com 429", async () => {
    const app = createTestApp();

    for (let index = 0; index < 5; index += 1) {
      await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validPF, email: `pessoa${index}@teste.local` })
        .expect(201);
    }

    const blocked = await request(app).post("/api/v1/auth/register").send({ ...validPF, email: "pessoa5@teste.local" });
    expect(blocked.status).toBe(429);
  });

  it("ignora X-Forwarded-For quando TRUST_PROXY=0 (DEC-068)", async () => {
    const app = createTestApp({ trustProxy: 0 });
    const attempt = (ip: string) =>
      request(app).post("/api/v1/auth/login").set("X-Forwarded-For", ip).send({ email: "x@teste.local", senha: "Errada@123" });

    for (let index = 0; index < 10; index += 1) {
      await attempt(`10.0.0.${index}`);
    }

    // Trocar o header não burla o limite.
    expect((await attempt("10.0.0.99")).status).toBe(429);
  });

  it("separa os limites por IP quando TRUST_PROXY=1 (proxy de borda confiável)", async () => {
    const app = createTestApp({ trustProxy: 1 });
    const attempt = (ip: string) =>
      request(app).post("/api/v1/auth/login").set("X-Forwarded-For", ip).send({ email: "x@teste.local", senha: "Errada@123" });

    for (let index = 0; index < 10; index += 1) {
      await attempt("203.0.113.10");
    }

    expect((await attempt("203.0.113.10")).status).toBe(429);
    expect((await attempt("203.0.113.20")).status).toBe(401);
  });
});

describe("requireRole (09 §74, 17_TESTING §38)", () => {
  function appWithRoute(...roles: Parameters<typeof requireRole>) {
    const app = express();
    app.use(express.json());
    app.use(
      session({ secret: "segredo-de-teste-com-pelo-menos-32-caracteres", resave: false, saveUninitialized: false }),
    );
    app.post("/login-teste", async (req, res) => {
      req.session.userId = req.body.userId;
      req.session.save(() => res.sendStatus(204));
    });
    app.get("/restrito", requireAuth, requireRole(...roles), (_req, res) => {
      res.json({ ok: true });
    });
    app.use(errorHandler);
    return app;
  }

  it.each([
    ["CLIENTE", ["ADMIN"], 403],
    ["COLETOR", ["ADMIN"], 403],
    ["ADMIN", ["ADMIN"], 200],
    ["COLETOR", ["COLETOR"], 200],
    ["ADMIN", ["COLETOR"], 403],
    ["CLIENTE", ["CLIENTE", "COLETOR"], 200],
  ] as const)("%s em rota que exige %j → %i", async (role, roles, expected) => {
    const user = await createUser({ email: `${role.toLowerCase()}@teste.local`, role });
    const agent = request.agent(appWithRoute(...roles));

    await agent.post("/login-teste").send({ userId: String(user._id) }).expect(204);
    const response = await agent.get("/restrito");

    expect(response.status).toBe(expected);
    if (expected === 403) expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("exige autenticação antes da role", async () => {
    const response = await request(appWithRoute("ADMIN")).get("/restrito");

    expect(response.status).toBe(401);
  });
});

describe("login de perfis criados fora do cadastro público", () => {
  it.each(["COLETOR", "ADMIN"] as const)("%s autentica e mantém sua role", async (role) => {
    await createUser({ email: `${role.toLowerCase()}@teste.local`, role });
    const agent = await loginAgent(createTestApp(), `${role.toLowerCase()}@teste.local`);

    expect((await agent.get("/api/v1/auth/me")).body.data.user.role).toBe(role);
  });
});
