import request from "supertest";
import { describe, expect, it } from "vitest";
import { ADMIN_IDLE_TIMEOUT_MS } from "../../src/config/session.js";
import { LoginThrottle } from "../../src/models/index.js";
import { createUser, loginAgent, sessionCookie, VALID_PASSWORD } from "../helpers/auth.js";
import { createMongoSessionStore, createTestApp, createTestMailer, tokenFromMessage } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const EMAIL = "alvo@teste.local";

describe("cabeçalhos de segurança da API (DEC-091)", () => {
  it("valem para respostas de sucesso, erro e rota inexistente", async () => {
    const app = createTestApp();

    for (const response of [
      await request(app).get("/api/v1/health"),
      await request(app).get("/api/v1/auth/me"),
      await request(app).get("/api/v1/nao-existe"),
    ]) {
      expect(response.headers["cache-control"]).toBe("no-store");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["content-security-policy"]).toBe("default-src 'none'; frame-ancestors 'none'");
      expect(response.headers["x-frame-options"]).toBe("DENY");
      expect(response.headers["referrer-policy"]).toBe("no-referrer");
      expect(response.headers["cross-origin-resource-policy"]).toBe("same-origin");
      expect(response.headers.etag).toBeUndefined();
      expect(response.headers["x-powered-by"]).toBeUndefined();
    }
  });
});

describe("bloqueio por conta contra força bruta (DEC-093)", () => {
  // Cada tentativa de um IP diferente: o limite por IP não interfere.
  let ip = 0;
  const attempt = (app: ReturnType<typeof createTestApp>, email: string, senha: string) =>
    request(app)
      .post("/api/v1/auth/login")
      .set("X-Forwarded-For", `198.18.0.${(ip += 1) % 250}`)
      .send({ email, senha });

  it("10 senhas erradas, de IPs diferentes, bloqueiam a conta até para a senha certa", async () => {
    await createUser({ email: EMAIL });
    const app = createTestApp({ trustProxy: 1 });

    for (let index = 0; index < 10; index += 1) {
      expect((await attempt(app, EMAIL, "Errada@123")).status).toBe(401);
    }

    const locked = await attempt(app, EMAIL, VALID_PASSWORD);
    expect(locked.status).toBe(429);
    expect(locked.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(locked.body.message).toBe("Muitas tentativas. Aguarde alguns minutos e tente novamente.");

    // Bloqueio vencido: a senha certa volta a funcionar e zera a contagem.
    await LoginThrottle.updateMany({}, { $set: { bloqueadoAte: new Date(Date.now() - 1000) } });
    expect((await attempt(app, EMAIL, VALID_PASSWORD)).status).toBe(200);
    expect(await LoginThrottle.countDocuments()).toBe(0);
  });

  it("e-mail sem conta recebe a mesma resposta: não revela quais contas existem", async () => {
    const app = createTestApp({ trustProxy: 1 });

    for (let index = 0; index < 10; index += 1) await attempt(app, "ninguem@teste.local", "Errada@123");

    const response = await attempt(app, "ninguem@teste.local", "Errada@123");
    expect(response.status).toBe(429);
    expect(response.body.message).toBe("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
  });

  it("guarda só o hash do e-mail, com expiração automática", async () => {
    const app = createTestApp({ trustProxy: 1 });
    await attempt(app, EMAIL, "Errada@123");

    const [record] = await LoginThrottle.find().lean();
    expect(record?.chave).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(record)).not.toContain(EMAIL);
    expect(record!.expiraEm.getTime()).toBeGreaterThan(Date.now());
  });

  it("falhas fora da janela de 15 minutos recomeçam a contagem", async () => {
    const app = createTestApp({ trustProxy: 1 });
    for (let index = 0; index < 9; index += 1) await attempt(app, EMAIL, "Errada@123");
    await LoginThrottle.updateMany({}, { $set: { janelaInicio: new Date(Date.now() - 16 * 60 * 1000) } });

    await attempt(app, EMAIL, "Errada@123");

    const [record] = await LoginThrottle.find().lean();
    expect(record?.falhas).toBe(1);
    expect(record?.bloqueadoAte ?? null).toBeNull();
  });

  it("redefinir a senha pelo link libera a conta na hora", async () => {
    await createUser({ email: EMAIL });
    const mailer = createTestMailer();
    const app = createTestApp({ trustProxy: 1, mailer });
    for (let index = 0; index < 10; index += 1) await attempt(app, EMAIL, "Errada@123");

    await request(app).post("/api/v1/auth/forgot-password").send({ email: EMAIL });
    await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: tokenFromMessage(mailer.messages[0]), novaSenha: "NovaSenha@456", confirmacaoSenha: "NovaSenha@456" });

    expect((await attempt(app, EMAIL, "NovaSenha@456")).status).toBe(200);
  });
});

describe("sessão curta do administrador (DEC-092)", () => {
  const maxAgeOf = (cookie: string | undefined) => {
    const expires = cookie?.match(/Expires=([^;]+)/)?.[1];
    return expires ? new Date(expires).getTime() - Date.now() : NaN;
  };

  it("o cookie do admin expira em 30 minutos; o dos demais perfis, em 7 dias", async () => {
    await createUser({ email: "admin@teste.local", role: "ADMIN" });
    await createUser({ email: EMAIL });
    const app = createTestApp();

    const admin = await request(app).post("/api/v1/auth/login").send({ email: "admin@teste.local", senha: VALID_PASSWORD });
    const client = await request(app).post("/api/v1/auth/login").send({ email: EMAIL, senha: VALID_PASSWORD });

    const adminAge = maxAgeOf(sessionCookie(admin.headers["set-cookie"]));
    expect(adminAge).toBeGreaterThan(ADMIN_IDLE_TIMEOUT_MS - 60_000);
    expect(adminAge).toBeLessThanOrEqual(ADMIN_IDLE_TIMEOUT_MS + 1000);
    expect(maxAgeOf(sessionCookie(client.headers["set-cookie"]))).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
  });

  it("a sessão do admin some do store após 30 minutos sem uso", async () => {
    await createUser({ email: "admin@teste.local", role: "ADMIN" });
    const app = createTestApp({ session: { store: createMongoSessionStore() } });
    const agent = await loginAgent(app, "admin@teste.local");

    const { default: mongoose } = await import("mongoose");
    const [stored] = await mongoose.connection.db!.collection("sessions").find().toArray();
    const storeAge = (stored!.expires as Date).getTime() - Date.now();
    expect(storeAge).toBeLessThanOrEqual(ADMIN_IDLE_TIMEOUT_MS + 1000);

    // Uso renova o prazo (inatividade, não duração total).
    expect((await agent.get("/api/v1/admin/users")).status).toBe(200);
  });
});
