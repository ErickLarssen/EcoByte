import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { executePurge, parsePurgeEnv, planPurge } from "../../src/database/purge/purge.js";
import { AuditLog, Collection, LoginThrottle, Notification, User } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { insertPendingCollection } from "../helpers/collections.js";
import { createMongoSessionStore, createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

describe("parsePurgeEnv (DEC-096)", () => {
  it("lê os e-mails, normaliza e só confirma com APAGAR", () => {
    expect(parsePurgeEnv({ PURGE_EMAILS: " A@Teste.local ; b@teste.local,a@teste.local " })).toEqual({
      emails: ["a@teste.local", "b@teste.local"],
      confirmar: false,
    });
    expect(parsePurgeEnv({ PURGE_EMAILS: "a@teste.local", PURGE_CONFIRMAR: "APAGAR" }).confirmar).toBe(true);
    expect(parsePurgeEnv({ PURGE_EMAILS: "a@teste.local", PURGE_CONFIRMAR: "sim" }).confirmar).toBe(false);
  });

  it("exige ao menos um e-mail válido", () => {
    expect(() => parsePurgeEnv({})).toThrow(/Informe ao menos um e-mail/);
    expect(() => parsePurgeEnv({ PURGE_EMAILS: "nao-e-email" })).toThrow(/e-mail válido/);
  });
});

describe("remoção definitiva de perfis (DEC-096)", () => {
  it("a simulação não altera nada", async () => {
    const demo = await createUser({ email: "demo@teste.local" });
    await insertPendingCollection(demo._id);

    const plan = await planPurge(["demo@teste.local", "inexistente@teste.local"]);

    expect(plan.users.map((user) => user.email)).toEqual(["demo@teste.local"]);
    expect(plan.naoEncontrados).toEqual(["inexistente@teste.local"]);
    expect(plan.coletas).toBe(1);
    expect(plan.bloqueios).toEqual([]);
    expect(await User.countDocuments()).toBe(1);
    expect(await Collection.countDocuments()).toBe(1);
  });

  it("apaga o perfil, as coletas dele, as notificações e as sessões, e registra na auditoria", async () => {
    const demo = await createUser({ email: "demo@teste.local" });
    const collector = await createUser({ email: "coletor@teste.local", role: "COLETOR" });
    const keep = await createUser({ email: "real@teste.local" });
    const collection = await insertPendingCollection(demo._id);
    await insertPendingCollection(keep._id);
    await Notification.create([
      { usuarioId: demo._id, tipo: "COLETA_ACEITA", titulo: "T", mensagem: "M" },
      // Aviso a outro usuário sobre a coleta que será apagada (NOVA_COLETA).
      { usuarioId: collector._id, tipo: "NOVA_COLETA", titulo: "T", mensagem: "M", referencia: { tipo: "COLETA", id: collection._id } },
      { usuarioId: keep._id, tipo: "COLETA_ACEITA", titulo: "T", mensagem: "M" },
    ]);
    const app = createTestApp({ session: { store: createMongoSessionStore() } });
    // Uma senha errada antes do login: o registro de tentativas também sai.
    await request(app).post("/api/v1/auth/login").send({ email: "demo@teste.local", senha: "Errada@123" });
    const session = await loginAgent(app, "demo@teste.local");
    await request(app).post("/api/v1/auth/login").send({ email: "demo@teste.local", senha: "Errada@123" });
    expect(await LoginThrottle.countDocuments()).toBe(1);
    const otherSession = await loginAgent(app, "real@teste.local");

    const plan = await planPurge(["demo@teste.local"]);
    expect(plan.sessoes).toBe(1);
    const result = await executePurge(plan);

    expect(result).toEqual({ usuarios: 1, coletas: 1, notificacoes: 2, sessoes: 1 });
    expect(await User.exists({ _id: demo._id })).toBeNull();
    expect(await Collection.countDocuments({ usuarioId: demo._id })).toBe(0);
    expect(await Notification.countDocuments()).toBe(1);
    expect((await session.get("/api/v1/auth/me")).status).toBe(401);
    // Os demais usuários e sessões ficam.
    expect(await Collection.countDocuments({ usuarioId: keep._id })).toBe(1);
    expect((await otherSession.get("/api/v1/auth/me")).status).toBe(200);
    expect(await mongoose.connection.db!.collection("sessions").countDocuments()).toBe(1);
    expect(await LoginThrottle.countDocuments()).toBe(0);

    const [log] = await AuditLog.find({ acao: "USUARIO_REMOVIDO" }).lean();
    expect(log).toMatchObject({ ator: { id: null, role: "SISTEMA" }, alvo: { tipo: "USUARIO" }, detalhes: { role: "CLIENTE" } });
    expect(String(log!.alvo!.id)).toBe(demo.id);
  });

  it("não apaga coleta de cliente de fora da lista atendida por um coletor da lista", async () => {
    const collector = await createUser({ email: "coletor-demo@teste.local", role: "COLETOR" });
    const real = await createUser({ email: "real@teste.local" });
    const collection = await insertPendingCollection(real._id);
    await Collection.updateOne({ _id: collection._id }, { $set: { coletorId: collector._id, status: "CONCLUIDA" } });

    const plan = await planPurge(["coletor-demo@teste.local"]);

    expect(plan.bloqueios).toHaveLength(1);
    expect(plan.bloqueios[0]).toContain("coletor-demo@teste.local");
    await expect(executePurge(plan)).rejects.toThrow(/nada foi apagado/);
    expect(await User.exists({ _id: collector._id })).not.toBeNull();
  });

  it("cliente e coletor de demonstração juntos: a coleta entre eles é apagada", async () => {
    const collector = await createUser({ email: "coletor-demo@teste.local", role: "COLETOR" });
    const client = await createUser({ email: "cliente-demo@teste.local" });
    const collection = await insertPendingCollection(client._id);
    await Collection.updateOne({ _id: collection._id }, { $set: { coletorId: collector._id, status: "CONCLUIDA" } });

    const plan = await planPurge(["coletor-demo@teste.local", "cliente-demo@teste.local"]);
    expect(plan.bloqueios).toEqual([]);

    expect((await executePurge(plan)).usuarios).toBe(2);
    expect(await Collection.countDocuments()).toBe(0);
  });

  it("não deixa o sistema sem administrador", async () => {
    await createUser({ email: "admin@teste.local", role: "ADMIN" });

    const plan = await planPurge(["admin@teste.local"]);

    expect(plan.bloqueios).toEqual(["A remoção deixaria o sistema sem nenhum administrador."]);
    await expect(executePurge(plan)).rejects.toThrow();
    expect(await User.countDocuments({ role: "ADMIN" })).toBe(1);
  });

  it("remove um administrador extra quando sobra outro", async () => {
    await createUser({ email: "admin@teste.local", role: "ADMIN" });
    await createUser({ email: "admin-demo@teste.local", role: "ADMIN" });

    const plan = await planPurge(["admin-demo@teste.local"]);

    expect(plan.bloqueios).toEqual([]);
    expect((await executePurge(plan)).usuarios).toBe(1);
  });

  it("apaga também uma conta já excluída pelo titular, pelo e-mail anonimizado", async () => {
    const user = await createUser({ email: "demo@teste.local" });
    await User.updateOne({ _id: user._id }, { $set: { email: `excluido-${user.id}@excluido.invalid`, status: "INATIVO" } });

    const plan = await planPurge([`excluido-${user.id}@excluido.invalid`]);

    expect((await executePurge(plan)).usuarios).toBe(1);
    expect(await User.exists({ _id: user._id })).toBeNull();
  });
});
