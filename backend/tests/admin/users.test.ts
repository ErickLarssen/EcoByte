import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { Collection, User } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { insertPendingCollection } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

type Agent = Awaited<ReturnType<typeof loginAgent>>;

let app: ReturnType<typeof createTestApp>;
let admin: Agent;
let adminId: string;
let clienteId: string;
let coletorId: string;

beforeEach(async () => {
  app = createTestApp({ trustProxy: 1 });
  adminId = String((await createUser({ email: "admin@teste.local", role: "ADMIN", nome: "Admin" }))._id);
  clienteId = String(
    (await createUser({ email: "cliente@teste.local", nome: "Mariana Cliente", telefone: "11988887777" }))._id,
  );
  coletorId = String((await createUser({ email: "coletor@teste.local", role: "COLETOR", nome: "Carlos" }))._id);
  admin = await loginAgent(app, "admin@teste.local");
});

describe("autorização das rotas administrativas (BR-035, DEC-033)", () => {
  it.each(["CLIENTE", "COLETOR"] as const)("%s recebe 403", async (role) => {
    const email = role === "CLIENTE" ? "cliente@teste.local" : "coletor@teste.local";
    const agent = await loginAgent(app, email);

    for (const path of ["/api/v1/admin/users", `/api/v1/admin/users/${clienteId}`, "/api/v1/admin/collections"]) {
      const response = await agent.get(path);
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }
    expect((await agent.patch(`/api/v1/admin/users/${clienteId}/status`).send({ status: "INATIVO" })).status).toBe(403);
  });

  it("sem sessão recebe 401", async () => {
    const { default: request } = await import("supertest");
    expect((await request(app).get("/api/v1/admin/users")).status).toBe(401);
  });
});

describe("GET /api/v1/admin/users (RF-041, RF-042)", () => {
  it("lista paginada, mais recentes primeiro, sem senhaHash nem documento", async () => {
    const response = await admin.get("/api/v1/admin/users?page=1&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
    expect(response.body.data.items.map((user: { email: string }) => user.email)).toEqual([
      "coletor@teste.local",
      "cliente@teste.local",
    ]);
    for (const user of response.body.data.items) {
      expect(user).not.toHaveProperty("senhaHash");
      expect(user).not.toHaveProperty("documento");
      expect(Object.keys(user).sort()).toEqual(
        ["createdAt", "dadosEmpresa", "email", "id", "nome", "role", "status", "telefone", "tipoCadastro", "trocaSenhaObrigatoria", "updatedAt"].sort(),
      );
    }
  });

  it("valida a paginação", async () => {
    const response = await admin.get("/api/v1/admin/users?limit=500");
    expect(response.status).toBe(400);
    expect(response.body.error.fields.limit).toBeDefined();
  });
});

describe("GET /api/v1/admin/users/:id (RF-042)", () => {
  it("retorna os dados permitidos do usuário", async () => {
    const response = await admin.get(`/api/v1/admin/users/${clienteId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      id: clienteId,
      nome: "Mariana Cliente",
      email: "cliente@teste.local",
      telefone: "11988887777",
      role: "CLIENTE",
      status: "ATIVO",
    });
  });

  it.each(["000000000000000000000000", "id-invalido"])("404 para %s", async (id) => {
    const response = await admin.get(`/api/v1/admin/users/${id}`);
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("RESOURCE_NOT_FOUND");
  });
});

describe("PATCH /api/v1/admin/users/:id/status (RF-043, DEC-075)", () => {
  it("desativa e reativa um cliente", async () => {
    const off = await admin.patch(`/api/v1/admin/users/${clienteId}/status`).send({ status: "INATIVO" });
    expect(off.status).toBe(200);
    expect(off.body.message).toBe("Usuário desativado.");
    expect(off.body.data.user.status).toBe("INATIVO");
    expect((await User.findById(clienteId).lean())?.status).toBe("INATIVO");

    const on = await admin.patch(`/api/v1/admin/users/${clienteId}/status`).send({ status: "ATIVO" });
    expect(on.status).toBe(200);
    expect(on.body.message).toBe("Usuário ativado.");
    expect((await User.findById(clienteId).lean())?.status).toBe("ATIVO");
  });

  it("a sessão do usuário desativado deixa de valer (06 §27.3)", async () => {
    const cliente = await loginAgent(app, "cliente@teste.local");
    await admin.patch(`/api/v1/admin/users/${clienteId}/status`).send({ status: "INATIVO" }).expect(200);

    const response = await cliente.get("/api/v1/collections");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("USER_INACTIVE");
  });

  it("repetir o status atual não é erro", async () => {
    const response = await admin.patch(`/api/v1/admin/users/${clienteId}/status`).send({ status: "ATIVO" });
    expect(response.status).toBe(200);
    expect(response.body.data.user.status).toBe("ATIVO");
  });

  it("não altera a própria conta nem outros administradores", async () => {
    const other = String((await createUser({ email: "admin2@teste.local", role: "ADMIN" }))._id);

    for (const id of [adminId, other]) {
      const response = await admin.patch(`/api/v1/admin/users/${id}/status`).send({ status: "INATIVO" });
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
      expect((await User.findById(id).lean())?.status).toBe("ATIVO");
    }
  });

  it("recusa desativar coletor com coleta em andamento (409)", async () => {
    const collection = await insertPendingCollection(new Types.ObjectId(clienteId));
    await Collection.updateOne(
      { _id: collection._id },
      { $set: { status: "A_CAMINHO", coletorId: new Types.ObjectId(coletorId), acceptedAt: new Date(), startedAt: new Date() } },
    );

    const response = await admin.patch(`/api/v1/admin/users/${coletorId}/status`).send({ status: "INATIVO" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("USER_HAS_ACTIVE_COLLECTIONS");
    expect(response.body.message).toContain("1 coleta em andamento");
    expect((await User.findById(coletorId).lean())?.status).toBe("ATIVO");
  });

  it("desativa coletor cujas coletas estão todas concluídas", async () => {
    const collection = await insertPendingCollection(new Types.ObjectId(clienteId));
    const now = new Date();
    await Collection.updateOne(
      { _id: collection._id },
      {
        $set: {
          status: "CONCLUIDA",
          coletorId: new Types.ObjectId(coletorId),
          acceptedAt: now,
          startedAt: now,
          collectedAt: now,
          deliveredAt: now,
          completedAt: now,
        },
      },
    );

    const response = await admin.patch(`/api/v1/admin/users/${coletorId}/status`).send({ status: "INATIVO" });
    expect(response.status).toBe(200);
  });

  it.each([{}, { status: "BLOQUEADO" }, { status: "inativo" }])("valida o corpo %j (OQ-059)", async (body) => {
    const response = await admin.patch(`/api/v1/admin/users/${clienteId}/status`).send(body);
    expect(response.status).toBe(400);
    expect(response.body.error.fields.status).toBe("Informe ATIVO ou INATIVO.");
  });

  it("ignora campos fora do contrato (ex.: role)", async () => {
    await admin.patch(`/api/v1/admin/users/${clienteId}/status`).send({ status: "INATIVO", role: "ADMIN" }).expect(200);
    expect((await User.findById(clienteId).lean())?.role).toBe("CLIENTE");
  });

  it("404 para usuário inexistente", async () => {
    const response = await admin.patch("/api/v1/admin/users/000000000000000000000000/status").send({ status: "INATIVO" });
    expect(response.status).toBe(404);
  });
});
