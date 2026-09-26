import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { Collection, User } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { insertPendingCollection, validCollectionBody } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const CLIENTE = "cliente@teste.local";
const OUTRO_CLIENTE = "outro@teste.local";

let app: ReturnType<typeof createTestApp>;
let cliente: Awaited<ReturnType<typeof loginAgent>>;

beforeEach(async () => {
  app = createTestApp({ trustProxy: 1 });
  await createUser({ email: CLIENTE });
  await createUser({ email: OUTRO_CLIENTE });
  cliente = await loginAgent(app, CLIENTE);
});

describe("POST /api/v1/collections (06_API §13.1)", () => {
  it("cria a coleta PENDENTE do cliente autenticado e responde 201 na visão do cliente", async () => {
    const response = await cliente.post("/api/v1/collections").send(validCollectionBody);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Coleta solicitada com sucesso.");
    expect(response.body.data.collection).toEqual({
      id: expect.any(String),
      status: "PENDENTE",
      enderecoColeta: { ...validCollectionBody.enderecoColeta, localizacao: null },
      itensDescarte: validCollectionBody.itensDescarte,
      dataAgendada: null,
      observacoes: "Portão azul.",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      acceptedAt: null,
      startedAt: null,
      collectedAt: null,
      deliveredAt: null,
      completedAt: null,
      coletor: null,
    });

    const stored = await Collection.findById(response.body.data.collection.id);
    const owner = await User.findOne({ email: CLIENTE });
    expect(stored?.usuarioId.equals(owner!._id)).toBe(true);
    expect(stored?.coletorId).toBeNull();
  });

  it("ignora status, usuarioId, coletorId e dataAgendada enviados (05 RT-005, OQ-020)", async () => {
    const outro = await User.findOne({ email: OUTRO_CLIENTE });

    const response = await cliente.post("/api/v1/collections").send({
      ...validCollectionBody,
      status: "CONCLUIDA",
      usuarioId: String(outro!._id),
      coletorId: String(outro!._id),
      dataAgendada: "2026-12-01",
    });

    expect(response.status).toBe(201);
    const stored = await Collection.findById(response.body.data.collection.id);
    expect(stored?.status).toBe("PENDENTE");
    expect(stored?.usuarioId.equals(outro!._id)).toBe(false);
    expect(stored?.coletorId).toBeNull();
    expect(stored?.dataAgendada).toBeNull();
  });

  it("normaliza CEP, UF, categoria e condição", async () => {
    const response = await cliente.post("/api/v1/collections").send({
      ...validCollectionBody,
      enderecoColeta: { ...validCollectionBody.enderecoColeta, cep: "09900-001", estado: "sp" },
      itensDescarte: [{ categoria: " monitores ", quantidade: 1, condicao: "obsoleto" }],
    });

    expect(response.status).toBe(201);
    expect(response.body.data.collection.enderecoColeta).toMatchObject({ cep: "09900001", estado: "SP" });
    expect(response.body.data.collection.itensDescarte).toEqual([
      { categoria: "MONITORES", quantidade: 1, condicao: "OBSOLETO" },
    ]);
  });

  it("aceita localização GeoJSON [longitude, latitude]", async () => {
    const localizacao = { type: "Point", coordinates: [-46.62, -23.68] };

    const response = await cliente
      .post("/api/v1/collections")
      .send({ ...validCollectionBody, enderecoColeta: { ...validCollectionBody.enderecoColeta, localizacao } });

    expect(response.status).toBe(201);
    expect(response.body.data.collection.enderecoColeta.localizacao).toEqual(localizacao);
  });

  it.each([
    ["sem itens", { itensDescarte: [] }, "itensDescarte", "Informe pelo menos um item de descarte."],
    [
      "quantidade zero",
      { itensDescarte: [{ categoria: "CABOS", quantidade: 0, condicao: "USADO" }] },
      "itensDescarte.0.quantidade",
      "A quantidade deve ser maior que zero.",
    ],
    [
      "item sem condição",
      { itensDescarte: [{ categoria: "CABOS", quantidade: 1 }] },
      "itensDescarte.0.condicao",
      "Informe a condição.",
    ],
    [
      "CEP inválido",
      { enderecoColeta: { ...validCollectionBody.enderecoColeta, cep: "123" } },
      "enderecoColeta.cep",
      "O CEP deve ter 8 dígitos.",
    ],
    [
      "coordenadas fora do limite",
      {
        enderecoColeta: {
          ...validCollectionBody.enderecoColeta,
          localizacao: { type: "Point", coordinates: [-23.68, -146.62] },
        },
      },
      "enderecoColeta.localizacao.coordinates.1",
      "Latitude inválida.",
    ],
    ["sem endereço", { enderecoColeta: undefined }, "enderecoColeta", "Informe o endereço da coleta."],
  ])("rejeita %s com 400", async (_caso, override, field, message) => {
    const response = await cliente.post("/api/v1/collections").send({ ...validCollectionBody, ...override });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.fields[field]).toBe(message);
    expect(await Collection.countDocuments()).toBe(0);
  });

  it("exige autenticação (BR-012)", async () => {
    const response = await request(app).post("/api/v1/collections").send(validCollectionBody);

    expect(response.status).toBe(401);
  });

  it.each(["COLETOR", "ADMIN"] as const)("não permite que %s crie coleta (403)", async (role) => {
    await createUser({ email: `${role}@teste.local`, role });
    const agent = await loginAgent(app, `${role}@teste.local`);

    const response = await agent.post("/api/v1/collections").send(validCollectionBody);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("GET /api/v1/collections (06_API §13.2)", () => {
  it("lista somente as coletas do cliente, mais recentes primeiro", async () => {
    const [owner, other] = await Promise.all([User.findOne({ email: CLIENTE }), User.findOne({ email: OUTRO_CLIENTE })]);
    const older = await insertPendingCollection(owner!._id, new Date("2026-09-20T10:00:00Z"));
    const newer = await insertPendingCollection(owner!._id, new Date("2026-09-22T10:00:00Z"));
    await insertPendingCollection(other!._id);

    const response = await cliente.get("/api/v1/collections");

    expect(response.status).toBe(200);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([String(newer._id), String(older._id)]);
    expect(response.body.data.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("pagina os resultados (06_API §7)", async () => {
    const owner = await User.findOne({ email: CLIENTE });
    for (let day = 1; day <= 3; day += 1) {
      await insertPendingCollection(owner!._id, new Date(`2026-09-0${day}T10:00:00Z`));
    }

    const page2 = await cliente.get("/api/v1/collections?page=2&limit=2");

    expect(page2.body.data.items).toHaveLength(1);
    expect(page2.body.data.pagination).toMatchObject({
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  it.each(["page=0", "limit=101", "limit=abc"])("rejeita paginação inválida (%s) com 400", async (query) => {
    const response = await cliente.get(`/api/v1/collections?${query}`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("não permite que o coletor use a listagem do cliente", async () => {
    await createUser({ email: "coletor@teste.local", role: "COLETOR" });
    const coletor = await loginAgent(app, "coletor@teste.local");

    expect((await coletor.get("/api/v1/collections")).status).toBe(403);
  });
});

describe("GET /api/v1/collections/:id — cliente (17_TESTING §35)", () => {
  it("retorna a própria coleta", async () => {
    const owner = await User.findOne({ email: CLIENTE });
    const collection = await insertPendingCollection(owner!._id);

    const response = await cliente.get(`/api/v1/collections/${String(collection._id)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.collection.id).toBe(String(collection._id));
  });

  it("responde 404 para coleta de outro cliente, sem revelar que existe", async () => {
    const other = await User.findOne({ email: OUTRO_CLIENTE });
    const collection = await insertPendingCollection(other!._id);

    const response = await cliente.get(`/api/v1/collections/${String(collection._id)}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("RESOURCE_NOT_FOUND");
  });

  it.each(["id-invalido", "000000000000000000000000"])("responde 404 para id %s", async (id) => {
    expect((await cliente.get(`/api/v1/collections/${id}`)).status).toBe(404);
  });

  it("não permite ADMIN nesta rota (usa /admin/collections, DEC-070)", async () => {
    const owner = await User.findOne({ email: CLIENTE });
    const collection = await insertPendingCollection(owner!._id);
    await createUser({ email: "admin@teste.local", role: "ADMIN" });
    const admin = await loginAgent(app, "admin@teste.local");

    expect((await admin.get(`/api/v1/collections/${String(collection._id)}`)).status).toBe(403);
  });

  it("não expõe identificadores internos nem e-mails", async () => {
    const response = await cliente.post("/api/v1/collections").send(validCollectionBody);
    const body = JSON.stringify(response.body);

    expect(body).not.toContain("usuarioId");
    expect(body).not.toContain("coletorId");
    expect(body).not.toContain("ecopontoId");
    expect(body).not.toContain("@teste.local");
  });
});
