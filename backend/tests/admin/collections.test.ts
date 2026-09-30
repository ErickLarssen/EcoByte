import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { Collection } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { insertPendingCollection } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

type Agent = Awaited<ReturnType<typeof loginAgent>>;

let admin: Agent;
let clienteId: Types.ObjectId;
let coletorId: Types.ObjectId;

beforeEach(async () => {
  const app = createTestApp({ trustProxy: 1 });
  await createUser({ email: "admin@teste.local", role: "ADMIN" });
  clienteId = (await createUser({ email: "cliente@teste.local", nome: "Mariana Cliente", telefone: "11988887777" }))._id;
  coletorId = (await createUser({ email: "coletor@teste.local", role: "COLETOR", nome: "Carlos Coletor" }))._id;
  admin = await loginAgent(app, "admin@teste.local");
});

async function insertAccepted(createdAt: Date) {
  const collection = await insertPendingCollection(clienteId, createdAt);
  await Collection.updateOne({ _id: collection._id }, { $set: { status: "ACEITA", coletorId, acceptedAt: new Date() } });
  return String(collection._id);
}

describe("GET /api/v1/admin/collections (RF-044)", () => {
  it("lista todas as coletas, mais recentes primeiro, com cliente e coletor", async () => {
    const older = String((await insertPendingCollection(clienteId, new Date("2026-09-20T10:00:00Z")))._id);
    const newer = await insertAccepted(new Date("2026-09-22T10:00:00Z"));

    const response = await admin.get("/api/v1/admin/collections");

    expect(response.status).toBe(200);
    expect(response.body.data.pagination.total).toBe(2);
    const [first, second] = response.body.data.items;
    expect([first.id, second.id]).toEqual([newer, older]);
    expect(first.cliente).toEqual({
      id: String(clienteId),
      nome: "Mariana Cliente",
      email: "cliente@teste.local",
      telefone: "11988887777",
    });
    expect(first.coletor).toMatchObject({ id: String(coletorId), nome: "Carlos Coletor" });
    expect(second.coletor).toBeNull();
    expect(first).not.toHaveProperty("usuarioId");
    expect(first).not.toHaveProperty("coletorId");
  });

  it("filtra por status (05 §16)", async () => {
    await insertPendingCollection(clienteId);
    const accepted = await insertAccepted(new Date());

    const response = await admin.get("/api/v1/admin/collections?status=ACEITA");

    expect(response.status).toBe(200);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([accepted]);
    expect(response.body.data.pagination.total).toBe(1);
  });

  it("recusa status inexistente", async () => {
    const response = await admin.get("/api/v1/admin/collections?status=CANCELADA");
    expect(response.status).toBe(400);
    expect(response.body.error.fields.status).toBe("status inválido.");
  });
});

describe("GET /api/v1/admin/collections/:id (RF-045)", () => {
  it("retorna a coleta com os dados de acompanhamento", async () => {
    const id = await insertAccepted(new Date());

    const response = await admin.get(`/api/v1/admin/collections/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.collection).toMatchObject({
      id,
      status: "ACEITA",
      cliente: { nome: "Mariana Cliente" },
      coletor: { nome: "Carlos Coletor" },
    });
    expect(response.body.data.collection.acceptedAt).not.toBeNull();
  });

  it.each(["000000000000000000000000", "id-invalido"])("404 para %s", async (id) => {
    const response = await admin.get(`/api/v1/admin/collections/${id}`);
    expect(response.status).toBe(404);
  });
});
