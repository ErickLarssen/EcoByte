import { Types } from "mongoose";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Collection, Notification } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { insertActiveEcopoint, insertPendingCollection } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

type Agent = Awaited<ReturnType<typeof loginAgent>>;

let app: ReturnType<typeof createTestApp>;
let cliente: Agent;
let coletor: Agent;
let clienteId: Types.ObjectId;

beforeEach(async () => {
  app = createTestApp({ trustProxy: 1 });
  clienteId = (await createUser({ email: "cliente@teste.local" }))._id;
  await createUser({ email: "outro@teste.local" });
  await createUser({ email: "coletor@teste.local", role: "COLETOR" });
  cliente = await loginAgent(app, "cliente@teste.local");
  coletor = await loginAgent(app, "coletor@teste.local");
  await insertActiveEcopoint();
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function insertNotification(usuarioId: Types.ObjectId, overrides: Record<string, unknown> = {}) {
  return Notification.create({
    usuarioId,
    tipo: "COLETA_ACEITA",
    titulo: "Coleta aceita",
    mensagem: "Um coletor EcoByte aceitou a sua coleta.",
    ...overrides,
  });
}

describe("notificações geradas nas etapas da coleta (RF-050, DEC-077)", () => {
  it("o cliente recebe uma notificação a cada etapa, referenciando a coleta", async () => {
    const collection = await insertPendingCollection(clienteId);
    const id = String(collection._id);

    for (const event of ["accept", "start", "collect", "deliver", "complete"]) {
      await coletor.post(`/api/v1/collections/${id}/${event}`).expect(200);
    }

    const stored = await Notification.find({ usuarioId: clienteId }).sort({ createdAt: 1, _id: 1 }).lean();
    expect(stored.map((notification) => notification.tipo)).toEqual([
      "COLETA_ACEITA",
      "COLETA_A_CAMINHO",
      "COLETA_RECOLHIDA",
      "COLETA_ENTREGUE_ECOPONTO",
      "COLETA_CONCLUIDA",
    ]);
    for (const notification of stored) {
      expect(notification.lida).toBe(false);
      expect(notification.referencia).toEqual({ tipo: "COLETA", id: collection._id });
    }
    // Ninguém além do cliente da coleta é notificado.
    expect(await Notification.countDocuments({ usuarioId: { $ne: clienteId } })).toBe(0);
  });

  it("transição recusada não gera notificação", async () => {
    const collection = await insertPendingCollection(clienteId);
    await coletor.post(`/api/v1/collections/${collection._id}/start`).expect(422);

    expect(await Notification.countDocuments()).toBe(0);
  });

  it("criar a coleta não gera notificação", async () => {
    await insertPendingCollection(clienteId);
    expect(await Notification.countDocuments()).toBe(0);
  });

  it("falha ao gravar a notificação não desfaz nem recusa a transição", async () => {
    const collection = await insertPendingCollection(clienteId);
    vi.spyOn(Notification, "create").mockRejectedValueOnce(new Error("indisponível"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await coletor.post(`/api/v1/collections/${collection._id}/accept`);

    expect(response.status).toBe(200);
    expect((await Collection.findById(collection._id).lean())?.status).toBe("ACEITA");
    expect(console.error).toHaveBeenCalled();
  });
});

describe("GET /api/v1/notifications (RF-048)", () => {
  it("lista somente as do usuário, mais recentes primeiro", async () => {
    const older = await insertNotification(clienteId, { createdAt: new Date("2026-09-20T10:00:00Z") });
    const newer = await insertNotification(clienteId, { createdAt: new Date("2026-09-22T10:00:00Z"), lida: true });
    const outroId = (await createUser({ email: "terceiro@teste.local" }))._id;
    await insertNotification(outroId);

    const response = await cliente.get("/api/v1/notifications");

    expect(response.status).toBe(200);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([String(newer._id), String(older._id)]);
    expect(response.body.data.pagination.total).toBe(2);
    expect(Object.keys(response.body.data.items[0]).sort()).toEqual(
      ["createdAt", "id", "lida", "mensagem", "referencia", "tipo", "titulo"].sort(),
    );
    expect(response.body.data.items[0]).not.toHaveProperty("usuarioId");
  });

  it("filtra não lidas: com limit=1, o total é o contador", async () => {
    await insertNotification(clienteId);
    await insertNotification(clienteId);
    await insertNotification(clienteId, { lida: true });

    const response = await cliente.get("/api/v1/notifications?lida=false&limit=1");

    expect(response.body.data.pagination.total).toBe(2);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].lida).toBe(false);
  });

  it("valida o filtro", async () => {
    const response = await cliente.get("/api/v1/notifications?lida=talvez");
    expect(response.status).toBe(400);
    expect(response.body.error.fields.lida).toBe("lida deve ser true ou false.");
  });

  it("exige autenticação", async () => {
    expect((await request(app).get("/api/v1/notifications")).status).toBe(401);
  });
});

describe("PATCH /api/v1/notifications/:id/read (RF-049)", () => {
  it("marca como lida e é idempotente", async () => {
    const notification = await insertNotification(clienteId);

    const first = await cliente.patch(`/api/v1/notifications/${notification._id}/read`);
    expect(first.status).toBe(200);
    expect(first.body.data.notification.lida).toBe(true);

    const again = await cliente.patch(`/api/v1/notifications/${notification._id}/read`);
    expect(again.status).toBe(200);
    expect((await Notification.findById(notification._id).lean())?.lida).toBe(true);
  });

  it("notificação de outro usuário responde 404 e não é alterada", async () => {
    const outroId = (await createUser({ email: "terceiro@teste.local" }))._id;
    const notification = await insertNotification(outroId);

    const response = await cliente.patch(`/api/v1/notifications/${notification._id}/read`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("RESOURCE_NOT_FOUND");
    expect((await Notification.findById(notification._id).lean())?.lida).toBe(false);
  });

  it.each(["000000000000000000000000", "id-invalido"])("404 para %s", async (id) => {
    expect((await cliente.patch(`/api/v1/notifications/${id}/read`)).status).toBe(404);
  });
});
