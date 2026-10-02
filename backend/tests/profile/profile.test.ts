import { Types } from "mongoose";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { Collection, User } from "../../src/models/index.js";
import { VALID_PASSWORD, createUser, loginAgent, sessionCookie } from "../helpers/auth.js";
import { insertPendingCollection, validCollectionBody } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

type Agent = Awaited<ReturnType<typeof loginAgent>>;

let app: ReturnType<typeof createTestApp>;
let cliente: Agent;
let clienteId: Types.ObjectId;

const NEW_PASSWORD = "NovaSenha@456";

beforeEach(async () => {
  app = createTestApp({ trustProxy: 1 });
  clienteId = (await createUser({ email: "cliente@teste.local", nome: "Mariana Cliente", telefone: "11988887777" }))._id;
  cliente = await loginAgent(app, "cliente@teste.local");
});

async function createPJ() {
  const user = await createUser({ email: "empresa@teste.local" });
  await User.updateOne(
    { _id: user._id },
    { $set: { tipoCadastro: "PJ", dadosEmpresa: { razaoSocial: "Tech Verde Ltda.", nomeFantasia: "Tech Verde" } } },
  );
  return loginAgent(app, "empresa@teste.local");
}

describe("GET /api/v1/profile (RF-011)", () => {
  it("retorna os dados do próprio usuário, sem senha", async () => {
    const response = await cliente.get("/api/v1/profile");

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      id: String(clienteId),
      nome: "Mariana Cliente",
      email: "cliente@teste.local",
      telefone: "11988887777",
      role: "CLIENTE",
      tipoCadastro: "PF",
      dadosEmpresa: null,
      status: "ATIVO",
    });
    expect(response.body.data.user).not.toHaveProperty("senhaHash");
  });

  it("exige autenticação", async () => {
    expect((await request(app).get("/api/v1/profile")).status).toBe(401);
  });
});

describe("PATCH /api/v1/profile (RF-012, DEC-078)", () => {
  it("altera nome e telefone; /auth/me reflete o novo nome", async () => {
    const response = await cliente.patch("/api/v1/profile").send({ nome: "  Mariana Souza ", telefone: "11 90000-0000" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Perfil atualizado.");
    expect(response.body.data.user).toMatchObject({ nome: "Mariana Souza", telefone: "11 90000-0000" });
    expect((await cliente.get("/api/v1/auth/me")).body.data.user.nome).toBe("Mariana Souza");
  });

  it("telefone vazio remove o telefone", async () => {
    const response = await cliente.patch("/api/v1/profile").send({ telefone: "" });
    expect(response.body.data.user.telefone).toBeNull();
  });

  it("descarta campos fora do contrato (e-mail, role, tipo, status)", async () => {
    const response = await cliente
      .patch("/api/v1/profile")
      .send({ nome: "Mariana", email: "outro@teste.local", role: "ADMIN", tipoCadastro: "PJ", status: "INATIVO" });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      email: "cliente@teste.local",
      role: "CLIENTE",
      tipoCadastro: "PF",
      status: "ATIVO",
    });
  });

  it("PJ altera os dados da empresa", async () => {
    const empresa = await createPJ();
    const response = await empresa
      .patch("/api/v1/profile")
      .send({ dadosEmpresa: { razaoSocial: "Tech Verde Soluções Ltda.", nomeFantasia: "" } });

    expect(response.status).toBe(200);
    expect(response.body.data.user.dadosEmpresa).toEqual({ razaoSocial: "Tech Verde Soluções Ltda.", nomeFantasia: null });
  });

  it("PF não pode enviar dados da empresa", async () => {
    const response = await cliente.patch("/api/v1/profile").send({ dadosEmpresa: { razaoSocial: "X" } });
    expect(response.status).toBe(400);
    expect(response.body.error.fields.dadosEmpresa).toBe("Dados empresariais se aplicam somente a cadastros PJ.");
  });

  it.each([
    [{}, "body", "Informe ao menos um campo para atualizar."],
    [{ email: "x@y.z" }, "body", "Informe ao menos um campo para atualizar."],
    [{ nome: "" }, "nome", "Informe o nome."],
    [{ telefone: "1".repeat(21) }, "telefone", "O telefone deve ter no máximo 20 caracteres."],
    [{ dadosEmpresa: { razaoSocial: "" } }, "dadosEmpresa.razaoSocial", "Informe a razão social."],
  ])("valida %j", async (body, field, message) => {
    const response = await cliente.patch("/api/v1/profile").send(body);
    expect(response.status).toBe(400);
    expect(response.body.error.fields[field]).toBe(message);
  });

  it("não altera o endereço já registrado nas coletas (RF-013)", async () => {
    const collection = await insertPendingCollection(clienteId);
    await cliente.patch("/api/v1/profile").send({ nome: "Outro Nome", telefone: null }).expect(200);

    const stored = await Collection.findById(collection._id).lean();
    expect(stored?.enderecoColeta.logradouro).toBe(validCollectionBody.enderecoColeta.logradouro);
  });
});

describe("PATCH /api/v1/profile/password (DEC-078)", () => {
  const body = { senhaAtual: VALID_PASSWORD, novaSenha: NEW_PASSWORD, confirmacaoNovaSenha: NEW_PASSWORD };

  it("troca a senha: a nova passa a valer e a antiga não", async () => {
    const response = await cliente.patch("/api/v1/profile/password").send(body);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Senha alterada com sucesso.");
    await loginAgent(app, "cliente@teste.local", NEW_PASSWORD);
    const old = await request(app).post("/api/v1/auth/login").send({ email: "cliente@teste.local", senha: VALID_PASSWORD });
    expect(old.status).toBe(401);
  });

  it("mantém o usuário autenticado, com um novo identificador de sessão (09 §20)", async () => {
    const response = await cliente.patch("/api/v1/profile/password").send(body);

    expect(sessionCookie(response.headers["set-cookie"])).toBeDefined();
    expect((await cliente.get("/api/v1/auth/me")).status).toBe(200);
  });

  it("senha atual incorreta: 400 no campo, sem alterar a senha", async () => {
    const response = await cliente.patch("/api/v1/profile/password").send({ ...body, senhaAtual: "Errada@123" });

    expect(response.status).toBe(400);
    expect(response.body.error.fields.senhaAtual).toBe("Senha atual incorreta.");
    await loginAgent(app, "cliente@teste.local", VALID_PASSWORD);
  });

  it("recusa nova senha igual à atual", async () => {
    const response = await cliente
      .patch("/api/v1/profile/password")
      .send({ senhaAtual: VALID_PASSWORD, novaSenha: VALID_PASSWORD, confirmacaoNovaSenha: VALID_PASSWORD });

    expect(response.status).toBe(400);
    expect(response.body.error.fields.novaSenha).toBe("A nova senha deve ser diferente da atual.");
  });

  it.each([
    [{ ...body, novaSenha: "fraca", confirmacaoNovaSenha: "fraca" }, "novaSenha"],
    [{ ...body, confirmacaoNovaSenha: "Diferente@1" }, "confirmacaoNovaSenha"],
    [{ novaSenha: NEW_PASSWORD, confirmacaoNovaSenha: NEW_PASSWORD }, "senhaAtual"],
  ])("valida o corpo (campo %#)", async (payload, field) => {
    const response = await cliente.patch("/api/v1/profile/password").send(payload);
    expect(response.status).toBe(400);
    expect(response.body.error.fields[field]).toBeDefined();
  });

  it("limita tentativas (DEC-067)", async () => {
    let last = 0;
    for (let attempt = 0; attempt < 11; attempt += 1) {
      last = (await cliente.patch("/api/v1/profile/password").send({ ...body, senhaAtual: "Errada@123" })).status;
    }
    expect(last).toBe(429);
  });
});
