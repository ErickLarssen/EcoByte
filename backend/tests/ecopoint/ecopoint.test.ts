import { Types } from "mongoose";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { Collection, Ecopoint } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { insertActiveEcopoint, insertPendingCollection } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

type Agent = Awaited<ReturnType<typeof loginAgent>>;

let app: ReturnType<typeof createTestApp>;
let admin: Agent;

beforeEach(async () => {
  app = createTestApp({ trustProxy: 1 });
  await createUser({ email: "admin@teste.local", role: "ADMIN" });
  admin = await loginAgent(app, "admin@teste.local");
});

const newAddress = {
  logradouro: "Rua Nova",
  numero: "50",
  bairro: "Centro",
  cidade: "Diadema",
  estado: "sp",
  cep: "09900-100",
};

describe("GET /api/v1/ecopoint (RF-036, RF-037, DEC-076)", () => {
  it("é público e retorna o ecoponto central", async () => {
    const ecopoint = await insertActiveEcopoint();

    const response = await request(app).get("/api/v1/ecopoint");

    expect(response.status).toBe(200);
    expect(response.body.data.ecopoint).toMatchObject({
      id: String(ecopoint._id),
      nome: "Ecoponto Central EcoByte",
      descricao: null,
      endereco: { logradouro: "Avenida EcoByte", complemento: null, cep: "09900000" },
      localizacao: { type: "Point", coordinates: [-46.6228, -23.6812] },
      horarios: [],
      status: "ATIVO",
    });
    expect(response.body.data.ecopoint).not.toHaveProperty("_id");
  });

  it("retorna também quando INATIVO, com o status (BR-038)", async () => {
    const ecopoint = await insertActiveEcopoint();
    await Ecopoint.updateOne({ _id: ecopoint._id }, { $set: { status: "INATIVO" } });

    const response = await request(app).get("/api/v1/ecopoint");
    expect(response.body.data.ecopoint.status).toBe("INATIVO");
  });

  it("404 quando não há ecoponto cadastrado", async () => {
    const response = await request(app).get("/api/v1/ecopoint");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("RESOURCE_NOT_FOUND");
  });
});

describe("PATCH /api/v1/ecopoint (RF-039, DEC-065)", () => {
  beforeEach(async () => {
    await insertActiveEcopoint();
  });

  it("altera somente os campos enviados", async () => {
    const response = await admin.patch("/api/v1/ecopoint").send({ nome: "  EcoByte Diadema  ", descricao: "Recebe eletrônicos." });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Ecoponto atualizado.");
    expect(response.body.data.ecopoint).toMatchObject({
      nome: "EcoByte Diadema",
      descricao: "Recebe eletrônicos.",
      endereco: { logradouro: "Avenida EcoByte" },
      status: "ATIVO",
    });
  });

  it("substitui o endereço normalizando UF e CEP", async () => {
    const response = await admin.patch("/api/v1/ecopoint").send({ endereco: newAddress });

    expect(response.status).toBe(200);
    expect(response.body.data.ecopoint.endereco).toEqual({ ...newAddress, estado: "SP", cep: "09900100", complemento: null });
  });

  it("altera e remove a localização", async () => {
    const set = await admin.patch("/api/v1/ecopoint").send({ localizacao: { type: "Point", coordinates: [-46.62, -23.68] } });
    expect(set.body.data.ecopoint.localizacao.coordinates).toEqual([-46.62, -23.68]);

    const removed = await admin.patch("/api/v1/ecopoint").send({ localizacao: null });
    expect(removed.status).toBe(200);
    expect(removed.body.data.ecopoint.localizacao).toBeNull();
  });

  it("descrição vazia é removida", async () => {
    await admin.patch("/api/v1/ecopoint").send({ descricao: "Algo" }).expect(200);
    const response = await admin.patch("/api/v1/ecopoint").send({ descricao: "   " });
    expect(response.body.data.ecopoint.descricao).toBeNull();
  });

  it("desativar faz as entregas falharem com ECOPOINT_UNAVAILABLE (DEC-053)", async () => {
    await admin.patch("/api/v1/ecopoint").send({ status: "INATIVO" }).expect(200);

    const cliente = await createUser({ email: "cliente@teste.local" });
    const coletorId = (await createUser({ email: "coletor@teste.local", role: "COLETOR" }))._id;
    const collection = await insertPendingCollection(new Types.ObjectId(String(cliente._id)));
    const now = new Date();
    await Collection.updateOne(
      { _id: collection._id },
      { $set: { status: "RECOLHIDA", coletorId, acceptedAt: now, startedAt: now, collectedAt: now } },
    );
    const coletor = await loginAgent(app, "coletor@teste.local");

    const response = await coletor.post(`/api/v1/collections/${collection._id}/deliver`);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("ECOPOINT_UNAVAILABLE");
  });

  it("descarta horarios e campos fora do contrato (OQ-005)", async () => {
    const response = await admin.patch("/api/v1/ecopoint").send({ nome: "EcoByte", horarios: [{ dia: "SEG" }], _id: "x" });
    expect(response.status).toBe(200);
    expect(response.body.data.ecopoint.horarios).toEqual([]);
  });

  it.each([
    [{}, "body", "Informe ao menos um campo para atualizar."],
    [{ horarios: [] }, "body", "Informe ao menos um campo para atualizar."],
    [{ nome: "" }, "nome", "Informe o nome."],
    [{ status: "FECHADO" }, "status", "Informe ATIVO ou INATIVO."],
    [{ endereco: { ...newAddress, cep: "123" } }, "endereco.cep", "O CEP deve ter 8 dígitos."],
    [{ localizacao: { type: "Point", coordinates: [-46.62, -123] } }, "localizacao.coordinates.1", "Latitude inválida."],
  ])("valida %j", async (body, field, message) => {
    const response = await admin.patch("/api/v1/ecopoint").send(body);
    expect(response.status).toBe(400);
    expect(response.body.error.fields[field]).toBe(message);
  });

  it.each(["CLIENTE", "COLETOR"] as const)("%s recebe 403", async (role) => {
    await createUser({ email: `${role}@teste.local`, role });
    const agent = await loginAgent(app, `${role}@teste.local`);

    const response = await agent.patch("/api/v1/ecopoint").send({ nome: "X" });
    expect(response.status).toBe(403);
    expect((await Ecopoint.findOne().lean())?.nome).toBe("Ecoponto Central EcoByte");
  });

  it("sem sessão recebe 401", async () => {
    const response = await request(app)
      .patch("/api/v1/ecopoint")
      .set("Origin", "http://localhost:3000")
      .send({ nome: "X" });
    expect(response.status).toBe(401);
  });
});
