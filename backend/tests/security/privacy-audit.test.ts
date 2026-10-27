import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { parseBootstrapEnv, runBootstrap } from "../../src/database/bootstrap/bootstrap.js";
import { AuditLog, Collection, Notification, User } from "../../src/models/index.js";
import { createUser, loginAgent, validPF, VALID_PASSWORD } from "../helpers/auth.js";
import { insertActiveEcopoint, insertPendingCollection } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

async function admin() {
  const user = await createUser({ email: "admin@teste.local", role: "ADMIN", nome: "Ana Admin" });
  return { user, agent: await loginAgent(app, "admin@teste.local") };
}

describe("auditoria administrativa (DEC-094)", () => {
  it("registra cadastro de coletor, mudança de status e edição do ecoponto, sem dados pessoais", async () => {
    const { user: adminUser, agent } = await admin();
    await insertActiveEcopoint();

    const created = await agent.post("/api/v1/admin/users").send({
      nome: "Carlos Coletor",
      email: "carlos@teste.local",
      telefone: "11988887777",
      senha: "Provisoria@123",
      confirmacaoSenha: "Provisoria@123",
    });
    const collectorId = created.body.data.user.id;
    await agent.patch(`/api/v1/admin/users/${collectorId}/status`).send({ status: "INATIVO" });
    // Repetir o status atual não gera registro.
    await agent.patch(`/api/v1/admin/users/${collectorId}/status`).send({ status: "INATIVO" });
    await agent.patch("/api/v1/ecopoint").send({ nome: "Ecoponto EcoByte", descricao: "Centro de triagem" });

    const logs = await AuditLog.find().sort({ createdAt: 1, _id: 1 }).lean();
    expect(logs.map((log) => log.acao)).toEqual(["COLETOR_CADASTRADO", "USUARIO_DESATIVADO", "ECOPONTO_ATUALIZADO"]);
    expect(String(logs[0]!.ator!.id)).toBe(String(adminUser._id));
    expect(logs[0]!.ator!.role).toBe("ADMIN");
    expect(String(logs[1]!.alvo!.id)).toBe(collectorId);
    expect(logs[1]!.detalhes).toEqual({ status: "INATIVO" });
    expect(logs[2]!.detalhes).toEqual({ campos: ["nome", "descricao"] });
    expect(JSON.stringify(logs)).not.toMatch(/carlos@teste\.local|Carlos Coletor|11988887777|Centro de triagem/);
  });

  it("o admin consulta o registro, com o nome do ator resolvido na leitura", async () => {
    const { agent } = await admin();
    const target = await createUser({ email: "cliente@teste.local" });
    await agent.patch(`/api/v1/admin/users/${target.id}/status`).send({ status: "INATIVO" });

    const response = await agent.get("/api/v1/admin/audit");

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0]).toMatchObject({
      acao: "USUARIO_DESATIVADO",
      ator: { role: "ADMIN", nome: "Ana Admin" },
      alvo: { tipo: "USUARIO", id: target.id },
    });
    expect(response.body.data.pagination.total).toBe(1);
  });

  it("só o admin consulta; ninguém altera nem apaga registros", async () => {
    await createUser({ email: "cliente@teste.local" });
    const client = await loginAgent(app, "cliente@teste.local");
    expect((await client.get("/api/v1/admin/audit")).status).toBe(403);

    const log = await AuditLog.create({ acao: "USUARIO_ATIVADO", ator: { id: null, role: "SISTEMA" }, alvo: { tipo: "USUARIO", id: (await createUser({ email: "x@teste.local" }))._id } });
    await expect(AuditLog.updateOne({ _id: log._id }, { $set: { acao: "COLETOR_CADASTRADO" } })).rejects.toThrow(/não podem ser alterados/);
    await expect(AuditLog.deleteOne({ _id: log._id })).rejects.toThrow(/não podem ser alterados/);
    await expect(AuditLog.deleteMany({})).rejects.toThrow(/não podem ser alterados/);
    expect(await AuditLog.countDocuments()).toBe(1);
  });

  it("a inicialização registra o primeiro administrador como ação do sistema", async () => {
    await runBootstrap(
      parseBootstrapEnv({ BOOTSTRAP_ADMIN_NOME: "Ana", BOOTSTRAP_ADMIN_EMAIL: "ana@teste.local", BOOTSTRAP_ADMIN_SENHA: "Provisoria@2026" }),
    );

    const [log] = await AuditLog.find().lean();
    expect(log).toMatchObject({ acao: "ADMIN_INICIAL_CRIADO", ator: { id: null, role: "SISTEMA" } });
  });
});

describe("GET /api/v1/profile/export (DEC-095)", () => {
  it("entrega os dados do titular como arquivo, sem segredos", async () => {
    const user = await createUser({ email: "cliente@teste.local", telefone: "11999990000" });
    await insertPendingCollection(user._id);
    await Notification.create({ usuarioId: user._id, tipo: "COLETA_ACEITA", titulo: "Coleta aceita", mensagem: "Ok." });
    const agent = await loginAgent(app, "cliente@teste.local");

    const response = await agent.get("/api/v1/profile/export");

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toContain('attachment; filename="ecobyte-meus-dados.json"');
    expect(response.headers["cache-control"]).toBe("no-store");
    const data = response.body.data;
    expect(data.titular).toMatchObject({ email: "cliente@teste.local", telefone: "11999990000" });
    expect(data.coletasSolicitadas).toHaveLength(1);
    expect(data.coletasSolicitadas[0].enderecoColeta.logradouro).toBe("Rua das Palmeiras");
    expect(data.notificacoes).toHaveLength(1);
    expect(JSON.stringify(data)).not.toMatch(/senhaHash|TokenHash|sessaoVersao|\$argon2/);
  });

  it("para o coletor, as coletas atendidas não trazem dados do cliente", async () => {
    const client = await createUser({ email: "cliente@teste.local", nome: "Mariana Cliente" });
    const collector = await createUser({ email: "coletor@teste.local", role: "COLETOR" });
    const collection = await insertPendingCollection(client._id);
    await Collection.updateOne({ _id: collection._id }, { $set: { coletorId: collector._id, status: "CONCLUIDA" } });
    const agent = await loginAgent(app, "coletor@teste.local");

    const data = (await agent.get("/api/v1/profile/export")).body.data;

    expect(data.coletasAtendidas).toHaveLength(1);
    expect(data.coletasAtendidas[0].status).toBe("CONCLUIDA");
    expect(JSON.stringify(data.coletasAtendidas)).not.toMatch(/Mariana|Palmeiras|cliente@teste/);
  });

  it("exige sessão", async () => {
    expect((await request(app).get("/api/v1/profile/export")).status).toBe(401);
  });
});

describe("DELETE /api/v1/profile (DEC-095)", () => {
  it("anonimiza a conta, apaga as notificações e encerra as sessões", async () => {
    const user = await createUser({ email: "cliente@teste.local", nome: "Mariana Cliente", telefone: "11999990000" });
    const collection = await insertPendingCollection(user._id);
    await Collection.updateOne({ _id: collection._id }, { $set: { status: "CONCLUIDA" } });
    await Notification.create({ usuarioId: user._id, tipo: "COLETA_CONCLUIDA", titulo: "Concluída", mensagem: "Ok." });
    const agent = await loginAgent(app, "cliente@teste.local");
    const other = await loginAgent(app, "cliente@teste.local");

    const response = await agent.delete("/api/v1/profile").send({ senha: VALID_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Conta excluída. Seus dados pessoais foram removidos.");
    for (const session of [agent, other]) expect((await session.get("/api/v1/auth/me")).status).toBe(401);

    const stored = await User.findById(user._id).lean();
    expect(stored).toMatchObject({ nome: "Conta excluída", telefone: null, status: "INATIVO" });
    expect(stored?.email).toBe(`excluido-${user.id}@excluido.invalid`);
    expect(stored?.excluidoEm).toBeInstanceOf(Date);
    expect(await Notification.countDocuments({ usuarioId: user._id })).toBe(0);

    // O histórico da coleta fica, sem o endereço identificável.
    const kept = await Collection.findById(collection._id).lean();
    expect(kept?.status).toBe("CONCLUIDA");
    expect(kept?.enderecoColeta).toMatchObject({ logradouro: "Endereço removido", numero: "—", complemento: null, bairro: "Centro", cidade: "Diadema" });
    expect(kept?.observacoes).toBeNull();

    // A senha antiga não entra mais, e o e-mail fica livre para um novo cadastro.
    const login = await request(app).post("/api/v1/auth/login").send({ email: "cliente@teste.local", senha: VALID_PASSWORD });
    expect(login.status).toBe(401);
    expect((await request(app).post("/api/v1/auth/register").send({ ...validPF, email: "cliente@teste.local" })).status).toBe(201);

    const [log] = await AuditLog.find({ acao: "CONTA_EXCLUIDA" }).lean();
    expect(String(log?.alvo?.id)).toBe(user.id);
  });

  it("confere a senha antes de excluir", async () => {
    await createUser({ email: "cliente@teste.local" });
    const agent = await loginAgent(app, "cliente@teste.local");

    const response = await agent.delete("/api/v1/profile").send({ senha: "Errada@123" });

    expect(response.status).toBe(400);
    expect(response.body.error.fields.senha).toBe("Senha incorreta.");
    expect((await agent.get("/api/v1/auth/me")).status).toBe(200);
  });

  it("coleta em andamento impede a exclusão", async () => {
    const user = await createUser({ email: "cliente@teste.local" });
    await insertPendingCollection(user._id);
    const agent = await loginAgent(app, "cliente@teste.local");

    const response = await agent.delete("/api/v1/profile").send({ senha: VALID_PASSWORD });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("USER_HAS_ACTIVE_COLLECTIONS");
    expect((await User.findById(user._id).lean())?.nome).not.toBe("Conta excluída");
  });

  it("o administrador não exclui a própria conta pelo perfil", async () => {
    const { agent } = await admin();
    expect((await agent.delete("/api/v1/profile").send({ senha: VALID_PASSWORD })).status).toBe(403);
  });

  it("conta excluída não pode ser reativada pelo admin", async () => {
    const user = await createUser({ email: "cliente@teste.local" });
    const client = await loginAgent(app, "cliente@teste.local");
    await client.delete("/api/v1/profile").send({ senha: VALID_PASSWORD });
    const { agent } = await admin();

    const response = await agent.patch(`/api/v1/admin/users/${user.id}/status`).send({ status: "ATIVO" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("ACCOUNT_DELETED");
  });
});
