import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { User } from "../../src/models/index.js";
import { FORGOT_PASSWORD_MESSAGE } from "../../src/services/password-reset.service.js";
import { createUser, loginAgent, VALID_PASSWORD } from "../helpers/auth.js";
import { createTestApp, createTestMailer, tokenFromMessage, type TestMailer } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const EMAIL = "carla@teste.local";
const NEW_PASSWORD = "NovaSenha@456";

let mailer: TestMailer;
let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  mailer = createTestMailer();
  app = createTestApp({ trustProxy: 1, mailer });
});

async function requestLink(email = EMAIL) {
  return request(app).post("/api/v1/auth/forgot-password").send({ email });
}

async function reset(token: string, novaSenha = NEW_PASSWORD, confirmacaoSenha = novaSenha) {
  return request(app).post("/api/v1/auth/reset-password").send({ token, novaSenha, confirmacaoSenha });
}

describe("POST /api/v1/auth/forgot-password (DEC-088)", () => {
  it("envia o link de redefinição e guarda só o hash do token", async () => {
    await createUser({ email: EMAIL });

    const response = await requestLink();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(FORGOT_PASSWORD_MESSAGE);
    expect(mailer.messages).toHaveLength(1);
    const [message] = mailer.messages;
    expect(message?.to).toBe(EMAIL);
    expect(message?.subject).toBe("Redefina sua senha no EcoByte");
    expect(message?.text).toContain("http://localhost:3000/redefinir-senha?token=");
    expect(message?.text).toContain("60 minutos");

    const stored = await User.findOne({ email: EMAIL }).select("+senhaResetTokenHash +senhaResetExpiraEm").lean();
    expect(stored?.senhaResetTokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored?.senhaResetTokenHash).not.toBe(tokenFromMessage(message));
    const minutes = (stored!.senhaResetExpiraEm!.getTime() - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(59);
    expect(minutes).toBeLessThanOrEqual(60);
  });

  it("responde igual para e-mail sem conta e para conta inativa, sem enviar nada", async () => {
    await createUser({ email: EMAIL, status: "INATIVO" });

    const unknown = await requestLink("ninguem@teste.local");
    const inactive = await requestLink();

    expect(unknown.status).toBe(200);
    expect(inactive.status).toBe(200);
    expect(unknown.body).toEqual(inactive.body);
    expect(mailer.messages).toHaveLength(0);
  });

  it("normaliza o e-mail e valida o formato", async () => {
    await createUser({ email: EMAIL });

    expect((await requestLink("  CARLA@Teste.Local ")).status).toBe(200);
    expect(mailer.messages).toHaveLength(1);

    const invalid = await requestLink("nao-e-email");
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("limita os pedidos por IP", async () => {
    let response = await requestLink();
    for (let attempt = 0; attempt < 5; attempt += 1) response = await requestLink();

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});

describe("POST /api/v1/auth/reset-password (DEC-088)", () => {
  it("define a nova senha com o token do link, que só vale uma vez", async () => {
    await createUser({ email: EMAIL });
    await requestLink();
    const token = tokenFromMessage(mailer.messages[0]);

    const response = await reset(token);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Senha redefinida. Entre com a nova senha.");

    const oldLogin = await request(app).post("/api/v1/auth/login").send({ email: EMAIL, senha: VALID_PASSWORD });
    expect(oldLogin.status).toBe(401);
    await loginAgent(app, EMAIL, NEW_PASSWORD);

    const again = await reset(token, "OutraSenha@789");
    expect(again.status).toBe(400);
    expect(again.body.error.code).toBe("INVALID_TOKEN");
  });

  it("um pedido novo invalida o link anterior", async () => {
    await createUser({ email: EMAIL });
    await requestLink();
    await requestLink();
    const [first, second] = mailer.messages.map((message) => tokenFromMessage(message));

    expect((await reset(first!)).body.error.code).toBe("INVALID_TOKEN");
    expect((await reset(second!)).status).toBe(200);
  });

  it("recusa o link vencido (TOKEN_EXPIRED)", async () => {
    await createUser({ email: EMAIL });
    await requestLink();
    await User.updateOne({ email: EMAIL }, { $set: { senhaResetExpiraEm: new Date(Date.now() - 1000) } });

    const response = await reset(tokenFromMessage(mailer.messages[0]));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("recusa o link de uma conta desativada depois do pedido", async () => {
    await createUser({ email: EMAIL });
    await requestLink();
    await User.updateOne({ email: EMAIL }, { $set: { status: "INATIVO" } });

    const response = await reset(tokenFromMessage(mailer.messages[0]));

    expect(response.body.error.code).toBe("INVALID_TOKEN");
  });

  it("aplica a política de senha e a confirmação", async () => {
    await createUser({ email: EMAIL });
    await requestLink();
    const token = tokenFromMessage(mailer.messages[0]);

    const weak = await reset(token, "fraca");
    expect(weak.status).toBe(400);
    expect(weak.body.error.fields.novaSenha).toBe("A senha deve ter pelo menos 8 caracteres.");

    const mismatch = await reset(token, NEW_PASSWORD, "Diferente@123");
    expect(mismatch.body.error.fields.confirmacaoSenha).toBe("A confirmação deve ser igual à nova senha.");

    // O token continua válido depois de uma tentativa recusada pela validação.
    expect((await reset(token)).status).toBe(200);
  });

  it("encerra todas as sessões abertas da conta", async () => {
    await createUser({ email: EMAIL });
    const phone = await loginAgent(app, EMAIL);
    const laptop = await loginAgent(app, EMAIL);
    await requestLink();

    await reset(tokenFromMessage(mailer.messages[0]));

    for (const agent of [phone, laptop]) {
      const me = await agent.get("/api/v1/auth/me");
      expect(me.status).toBe(401);
      expect(me.body.message).toBe("Sua sessão foi encerrada. Entre novamente.");
    }
  });

  it("dispensa a troca da senha provisória (DEC-083)", async () => {
    const user = await createUser({ email: EMAIL });
    await User.updateOne({ _id: user._id }, { $set: { trocaSenhaObrigatoria: true } });
    await requestLink();

    await reset(tokenFromMessage(mailer.messages[0]));

    const agent = await loginAgent(app, EMAIL, NEW_PASSWORD);
    const me = await agent.get("/api/v1/auth/me");
    expect(me.body.data.user.trocaSenhaObrigatoria).toBe(false);
  });
});

describe("troca de senha no perfil (DEC-088)", () => {
  it("mantém a sessão atual e encerra as demais", async () => {
    await createUser({ email: EMAIL });
    const current = await loginAgent(app, EMAIL);
    const other = await loginAgent(app, EMAIL);

    const response = await current
      .patch("/api/v1/profile/password")
      .send({ senhaAtual: VALID_PASSWORD, novaSenha: NEW_PASSWORD, confirmacaoNovaSenha: NEW_PASSWORD });

    expect(response.status).toBe(200);
    expect((await current.get("/api/v1/auth/me")).status).toBe(200);
    expect((await other.get("/api/v1/auth/me")).status).toBe(401);

    // Um novo login depois da troca vale normalmente.
    const later = await loginAgent(app, EMAIL, NEW_PASSWORD);
    expect((await later.get("/api/v1/auth/me")).status).toBe(200);
  });
});
