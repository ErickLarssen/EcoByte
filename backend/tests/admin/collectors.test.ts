import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { User } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { validCollectionBody } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

type Agent = Awaited<ReturnType<typeof loginAgent>>;

const PROVISIONAL = "Provisoria@123";
const NEW_PASSWORD = "Definitiva@456";

const collector = {
  nome: "Carlos Coletor",
  email: "Carlos.Coletor@Teste.Local",
  telefone: "11 98888-7777",
  senha: PROVISIONAL,
  confirmacaoSenha: PROVISIONAL,
};

let app: ReturnType<typeof createTestApp>;
let admin: Agent;

beforeEach(async () => {
  app = createTestApp({ trustProxy: 1 });
  await createUser({ email: "admin@teste.local", role: "ADMIN" });
  admin = await loginAgent(app, "admin@teste.local");
});

describe("POST /api/v1/admin/users — cadastro de coletor (DEC-083)", () => {
  it("cria o coletor ativo, verificado e com troca de senha obrigatória", async () => {
    const response = await admin.post("/api/v1/admin/users").send(collector);

    expect(response.status).toBe(201);
    expect(response.body.data.user).toMatchObject({
      nome: "Carlos Coletor",
      email: "carlos.coletor@teste.local",
      telefone: "11 98888-7777",
      role: "COLETOR",
      tipoCadastro: "PF",
      status: "ATIVO",
      trocaSenhaObrigatoria: true,
    });
    expect(response.body.data.user).not.toHaveProperty("senhaHash");

    const stored = await User.findOne({ email: "carlos.coletor@teste.local" }).select("+senhaHash").lean();
    expect(stored?.senhaHash).not.toBe(PROVISIONAL);
    expect(stored?.emailVerificado).toBe(true);
  });

  it("descarta role e status enviados: sempre COLETOR ATIVO", async () => {
    const response = await admin.post("/api/v1/admin/users").send({ ...collector, role: "ADMIN", status: "INATIVO" });
    expect(response.body.data.user).toMatchObject({ role: "COLETOR", status: "ATIVO" });
  });

  it("e-mail já cadastrado responde 409", async () => {
    await createUser({ email: "carlos.coletor@teste.local" });
    const response = await admin.post("/api/v1/admin/users").send(collector);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it.each([
    [{ telefone: "" }, "telefone", "Informe o telefone."],
    [{ senha: "fraca", confirmacaoSenha: "fraca" }, "senha", "A senha deve ter pelo menos 8 caracteres."],
    [{ confirmacaoSenha: "Outra@1234" }, "confirmacaoSenha", "A confirmação deve ser igual à senha."],
    [{ email: "invalido" }, "email", "Informe um e-mail válido."],
  ])("valida %j", async (override, field, message) => {
    const response = await admin.post("/api/v1/admin/users").send({ ...collector, ...override });
    expect(response.status).toBe(400);
    expect(response.body.error.fields[field]).toBe(message);
  });

  it.each(["CLIENTE", "COLETOR"] as const)("%s recebe 403", async (role) => {
    await createUser({ email: `${role}@teste.local`, role });
    const agent = await loginAgent(app, `${role}@teste.local`);
    expect((await agent.post("/api/v1/admin/users").send(collector)).status).toBe(403);
  });
});

describe("senha provisória: troca obrigatória (DEC-083)", () => {
  async function newCollectorAgent() {
    await admin.post("/api/v1/admin/users").send(collector).expect(201);
    return loginAgent(app, "carlos.coletor@teste.local", PROVISIONAL);
  }

  it("até a troca, só autenticação e a própria troca são aceitas", async () => {
    const agent = await newCollectorAgent();

    expect((await agent.get("/api/v1/auth/me")).body.data.user.trocaSenhaObrigatoria).toBe(true);
    for (const path of ["/api/v1/collections/available", "/api/v1/notifications", "/api/v1/profile"]) {
      const response = await agent.get(path);
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");
    }
  });

  it("depois da troca, o coletor usa o sistema normalmente", async () => {
    const agent = await newCollectorAgent();

    await agent
      .patch("/api/v1/profile/password")
      .send({ senhaAtual: PROVISIONAL, novaSenha: NEW_PASSWORD, confirmacaoNovaSenha: NEW_PASSWORD })
      .expect(200);

    expect((await agent.get("/api/v1/auth/me")).body.data.user.trocaSenhaObrigatoria).toBe(false);
    expect((await agent.get("/api/v1/collections/available")).status).toBe(200);
    await loginAgent(app, "carlos.coletor@teste.local", NEW_PASSWORD);
  });
});

describe("notificação de nova coleta aos coletores (DEC-084)", () => {
  it("cada coletor ativo recebe NOVA_COLETA quando um cliente solicita", async () => {
    await createUser({ email: "ativo@teste.local", role: "COLETOR" });
    await createUser({ email: "inativo@teste.local", role: "COLETOR", status: "INATIVO" });
    await createUser({ email: "cliente@teste.local" });
    const cliente = await loginAgent(app, "cliente@teste.local");
    const ativo = await loginAgent(app, "ativo@teste.local");

    const created = await cliente.post("/api/v1/collections").send(validCollectionBody).expect(201);

    const notifications = await ativo.get("/api/v1/notifications");
    expect(notifications.body.data.items).toHaveLength(1);
    expect(notifications.body.data.items[0]).toMatchObject({
      tipo: "NOVA_COLETA",
      titulo: "Nova coleta disponível",
      referencia: { tipo: "COLETA", id: created.body.data.collection.id },
      lida: false,
    });

    const { Notification } = await import("../../src/models/index.js");
    const inativo = await User.findOne({ email: "inativo@teste.local" }).lean();
    expect(await Notification.countDocuments({ usuarioId: inativo!._id })).toBe(0);
    expect(await Notification.countDocuments({ tipo: "NOVA_COLETA" })).toBe(1);
  });
});

describe("GET /api/v1/collections/assigned?grupo= (DEC-084)", () => {
  it("separa em andamento e concluídas", async () => {
    await createUser({ email: "cliente@teste.local" });
    await createUser({ email: "coletor@teste.local", role: "COLETOR" });
    const cliente = await loginAgent(app, "cliente@teste.local");
    const coletor = await loginAgent(app, "coletor@teste.local");
    const { insertActiveEcopoint } = await import("../helpers/collections.js");
    await insertActiveEcopoint();

    const ids: string[] = [];
    for (let i = 0; i < 2; i += 1) {
      const response = await cliente.post("/api/v1/collections").send(validCollectionBody).expect(201);
      ids.push(response.body.data.collection.id);
      await coletor.post(`/api/v1/collections/${response.body.data.collection.id}/accept`).expect(200);
    }
    for (const event of ["start", "collect", "deliver", "complete"]) {
      await coletor.post(`/api/v1/collections/${ids[0]}/${event}`).expect(200);
    }

    const andamento = await coletor.get("/api/v1/collections/assigned?grupo=andamento");
    const concluidas = await coletor.get("/api/v1/collections/assigned?grupo=concluidas");
    const todas = await coletor.get("/api/v1/collections/assigned");

    expect(andamento.body.data.items.map((item: { id: string }) => item.id)).toEqual([ids[1]]);
    expect(concluidas.body.data.items.map((item: { id: string }) => item.id)).toEqual([ids[0]]);
    expect(todas.body.data.pagination.total).toBe(2);
    expect((await coletor.get("/api/v1/collections/assigned?grupo=outro")).status).toBe(400);
  });
});

describe("sem sessão", () => {
  it("POST /api/v1/admin/users exige autenticação", async () => {
    const response = await request(app)
      .post("/api/v1/admin/users")
      .set("Origin", "http://localhost:3000")
      .send(collector);
    expect(response.status).toBe(401);
  });
});
