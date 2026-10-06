import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../../src/models/index.js";
import { createUser, loginAgent, validPF } from "../helpers/auth.js";
import { validCollectionBody } from "../helpers/collections.js";
import { createTestApp, createTestMailer, tokenFromMessage, type TestMailer } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

let mailer: TestMailer;
let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  mailer = createTestMailer();
  app = createTestApp({ trustProxy: 1, mailer });
});

async function registerAgent() {
  const agent = request.agent(app);
  const response = await agent.post("/api/v1/auth/register").send(validPF);
  expect(response.status).toBe(201);
  return agent;
}

describe("cadastro com verificação de e-mail (DEC-082)", () => {
  it("cria a conta não verificada e envia o link para o e-mail cadastrado", async () => {
    const agent = await registerAgent();

    expect(mailer.messages).toHaveLength(1);
    const [message] = mailer.messages;
    expect(message?.to).toBe(validPF.email);
    expect(message?.subject).toBe("Confirme seu e-mail no EcoByte");
    expect(message?.text).toContain("http://localhost:3000/verificar-email?token=");

    const me = await agent.get("/api/v1/auth/me");
    expect(me.body.data.user.emailVerificado).toBe(false);

    // Só o hash do token é guardado.
    const stored = await User.findOne({ email: validPF.email }).select("+emailVerificacaoTokenHash").lean();
    expect(stored?.emailVerificacaoTokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored?.emailVerificacaoTokenHash).not.toBe(tokenFromMessage(message));
  });

  it("falha no envio do e-mail não impede o cadastro", async () => {
    const failing = { messages: [], send: vi.fn().mockRejectedValue(new Error("SMTP fora")) };
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await request(createTestApp({ mailer: failing })).post("/api/v1/auth/register").send(validPF);

    expect(response.status).toBe(201);
    expect(failing.send).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });

  it("antes de confirmar, o cliente não solicita coleta (403 EMAIL_NOT_VERIFIED)", async () => {
    const agent = await registerAgent();

    const response = await agent.post("/api/v1/collections").send(validCollectionBody);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("EMAIL_NOT_VERIFIED");
    expect((await agent.get("/api/v1/collections")).status).toBe(200);
  });
});

describe("POST /api/v1/auth/verify-email", () => {
  it("confirma o e-mail com o token do link, que só vale uma vez", async () => {
    const agent = await registerAgent();
    const token = tokenFromMessage(mailer.messages[0]);

    const response = await request(app).post("/api/v1/auth/verify-email").send({ token });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("E-mail confirmado com sucesso.");
    expect((await agent.get("/api/v1/auth/me")).body.data.user.emailVerificado).toBe(true);
    expect((await agent.post("/api/v1/collections").send(validCollectionBody)).status).toBe(201);

    const again = await request(app).post("/api/v1/auth/verify-email").send({ token });
    expect(again.status).toBe(400);
    expect(again.body.error.code).toBe("INVALID_TOKEN");
  });

  it("token inexistente responde INVALID_TOKEN", async () => {
    const response = await request(app).post("/api/v1/auth/verify-email").send({ token: "nao-existe" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_TOKEN");
  });

  it("token expirado responde TOKEN_EXPIRED", async () => {
    await registerAgent();
    const token = tokenFromMessage(mailer.messages[0]);
    await User.updateOne({ email: validPF.email }, { $set: { emailVerificacaoExpiraEm: new Date(Date.now() - 1000) } });

    const response = await request(app).post("/api/v1/auth/verify-email").send({ token });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("TOKEN_EXPIRED");
    expect((await User.findOne({ email: validPF.email }).lean())?.emailVerificado).toBe(false);
  });

  it("valida o corpo", async () => {
    const response = await request(app).post("/api/v1/auth/verify-email").send({});
    expect(response.status).toBe(400);
    expect(response.body.error.fields.token).toBeDefined();
  });
});

describe("POST /api/v1/auth/verify-email/resend", () => {
  it("envia um novo link e invalida o anterior", async () => {
    const agent = await registerAgent();
    const first = tokenFromMessage(mailer.messages[0]);

    const response = await agent.post("/api/v1/auth/verify-email/resend");

    expect(response.status).toBe(200);
    expect(mailer.messages).toHaveLength(2);
    const second = tokenFromMessage(mailer.messages[1]);
    expect(second).not.toBe(first);
    expect((await request(app).post("/api/v1/auth/verify-email").send({ token: first })).status).toBe(400);
    expect((await request(app).post("/api/v1/auth/verify-email").send({ token: second })).status).toBe(200);
  });

  it("conta já verificada responde 409 EMAIL_ALREADY_VERIFIED", async () => {
    await createUser({ email: "antiga@teste.local" });
    const agent = await loginAgent(app, "antiga@teste.local");

    const response = await agent.post("/api/v1/auth/verify-email/resend");

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_VERIFIED");
    expect(mailer.messages).toHaveLength(0);
  });

  it("exige sessão", async () => {
    expect((await request(app).post("/api/v1/auth/verify-email/resend")).status).toBe(401);
  });
});

describe("contas criadas pela equipe e anteriores (DEC-082)", () => {
  it("contam como verificadas, inclusive sem o campo gravado", async () => {
    await createUser({ email: "coletor@teste.local", role: "COLETOR" });
    await User.collection.insertOne({
      nome: "Conta Antiga",
      email: "legado@teste.local",
      senhaHash: (await User.findOne({ email: "coletor@teste.local" }).select("+senhaHash").lean())!.senhaHash,
      role: "CLIENTE",
      tipoCadastro: "PF",
      status: "ATIVO",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const email of ["coletor@teste.local", "legado@teste.local"]) {
      const agent = await loginAgent(app, email);
      expect((await agent.get("/api/v1/auth/me")).body.data.user.emailVerificado).toBe(true);
    }
  });
});
