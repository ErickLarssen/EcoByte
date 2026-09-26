import { Types } from "mongoose";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { findCollectionInvariantViolations, type CollectionSnapshot } from "../../src/domain/collection-invariants.js";
import { Collection, Ecopoint, User } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { insertActiveEcopoint, insertPendingCollection, validCollectionBody } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

type Agent = Awaited<ReturnType<typeof loginAgent>>;

let app: ReturnType<typeof createTestApp>;
let clienteId: string;
let coletorA: Agent;
let coletorB: Agent;
let coletorAId: string;

beforeEach(async () => {
  app = createTestApp({ trustProxy: 1 });
  const cliente = await createUser({
    email: "cliente@teste.local",
    nome: "Mariana Cliente",
    telefone: "11988887777",
  });
  clienteId = String(cliente._id);

  const a = await createUser({ email: "coletor.a@teste.local", role: "COLETOR" });
  await createUser({ email: "coletor.b@teste.local", role: "COLETOR" });
  coletorAId = String(a._id);
  coletorA = await loginAgent(app, "coletor.a@teste.local");
  coletorB = await loginAgent(app, "coletor.b@teste.local");
  await insertActiveEcopoint();
});

async function newPendingId(createdAt?: Date): Promise<string> {
  const collection = await insertPendingCollection(new Types.ObjectId(clienteId), createdAt);
  return String(collection._id);
}

async function stored(id: string) {
  return Collection.findById(id).lean();
}

describe("GET /api/v1/collections/available (06_API §14.1)", () => {
  it("lista somente PENDENTE, mais antigas primeiro, sem dados do cliente", async () => {
    const newer = await newPendingId(new Date("2026-09-22T10:00:00Z"));
    const older = await newPendingId(new Date("2026-09-20T10:00:00Z"));
    const taken = await newPendingId();
    await coletorB.post(`/api/v1/collections/${taken}/accept`).expect(200);

    const response = await coletorA.get("/api/v1/collections/available");

    expect(response.status).toBe(200);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([older, newer]);
    for (const item of response.body.data.items) {
      expect(item.cliente).toBeNull();
      expect(item.enderecoColeta.logradouro).toBe(validCollectionBody.enderecoColeta.logradouro);
    }
    expect(response.body.data.pagination.total).toBe(2);
  });

  it("não é acessível a CLIENTE", async () => {
    await createUser({ email: "outro.cliente@teste.local" });
    const cliente = await loginAgent(app, "outro.cliente@teste.local");

    expect((await cliente.get("/api/v1/collections/available")).status).toBe(403);
  });
});

describe("GET /api/v1/collections/assigned (06_API §14.2)", () => {
  it("lista somente as coletas do coletor, com nome e telefone do cliente", async () => {
    const mine = await newPendingId();
    const theirs = await newPendingId();
    await newPendingId();
    await coletorA.post(`/api/v1/collections/${mine}/accept`).expect(200);
    await coletorB.post(`/api/v1/collections/${theirs}/accept`).expect(200);

    const response = await coletorA.get("/api/v1/collections/assigned");

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0]).toMatchObject({
      id: mine,
      status: "ACEITA",
      cliente: { nome: "Mariana Cliente", telefone: "11988887777" },
    });
  });
});

describe("GET /api/v1/collections/:id — coletor (DEC-070)", () => {
  it("vê coleta PENDENTE sem dados do cliente", async () => {
    const id = await newPendingId();

    const response = await coletorA.get(`/api/v1/collections/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.collection.cliente).toBeNull();
    expect(JSON.stringify(response.body)).not.toContain("Mariana");
  });

  it("vê a própria coleta com nome e telefone do cliente", async () => {
    const id = await newPendingId();
    await coletorA.post(`/api/v1/collections/${id}/accept`).expect(200);

    const response = await coletorA.get(`/api/v1/collections/${id}`);

    expect(response.body.data.collection.cliente).toEqual({ nome: "Mariana Cliente", telefone: "11988887777" });
  });

  it("recebe 404 para coleta atribuída a outro coletor", async () => {
    const id = await newPendingId();
    await coletorB.post(`/api/v1/collections/${id}/accept`).expect(200);

    expect((await coletorA.get(`/api/v1/collections/${id}`)).status).toBe(404);
  });
});

describe("fluxo completo do coletor (17_TESTING §46–§50, CA-004)", () => {
  it("PENDENTE → ACEITA → A_CAMINHO → RECOLHIDA → ENTREGUE_ECOPONTO → CONCLUIDA", async () => {
    const id = await newPendingId(new Date(Date.now() - 60_000));
    const ecopoint = await Ecopoint.findOne();

    const steps = [
      ["accept", "ACEITA", "Coleta aceita.", "acceptedAt"],
      ["start", "A_CAMINHO", "Rota iniciada.", "startedAt"],
      ["collect", "RECOLHIDA", "Recolhimento confirmado.", "collectedAt"],
      ["deliver", "ENTREGUE_ECOPONTO", "Entrega no ecoponto registrada.", "deliveredAt"],
      ["complete", "CONCLUIDA", "Coleta concluída.", "completedAt"],
    ] as const;

    for (const [event, status, message, timestampField] of steps) {
      const response = await coletorA.post(`/api/v1/collections/${id}/${event}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(message);
      expect(response.body.data.collection.status).toBe(status);
      expect(response.body.data.collection[timestampField]).not.toBeNull();
    }

    const final = await stored(id);
    expect(final?.coletorId && String(final.coletorId)).toBe(coletorAId);
    expect(final?.ecopontoId && String(final.ecopontoId)).toBe(String(ecopoint!._id));
    expect(findCollectionInvariantViolations(final as unknown as CollectionSnapshot)).toEqual([]);
  });

  it("o cliente acompanha o status e vê somente o nome do coletor", async () => {
    await createUser({ email: "dono@teste.local" });
    const dono = await loginAgent(app, "dono@teste.local");
    const created = await dono.post("/api/v1/collections").send(validCollectionBody).expect(201);
    const id = created.body.data.collection.id;

    await coletorA.post(`/api/v1/collections/${id}/accept`).expect(200);
    const response = await dono.get(`/api/v1/collections/${id}`);

    expect(response.body.data.collection.status).toBe("ACEITA");
    expect(response.body.data.collection.coletor).toEqual({ nome: "Usuário COLETOR" });
    expect(JSON.stringify(response.body)).not.toContain("coletor.a@teste.local");
  });
});

describe("transições inválidas (17_TESTING §20, 14 §65–§67)", () => {
  it.each([
    ["start", "PENDENTE", "A_CAMINHO"],
    ["collect", "PENDENTE", "RECOLHIDA"],
    ["complete", "PENDENTE", "CONCLUIDA"],
  ] as const)("%s em coleta PENDENTE → 422", async (event, currentStatus, requestedStatus) => {
    const id = await newPendingId();

    const response = await coletorA.post(`/api/v1/collections/${id}/${event}`);

    expect(response.status).toBe(422);
    expect(response.body.error).toEqual({
      code: "INVALID_STATUS_TRANSITION",
      fields: { currentStatus, requestedStatus },
    });
    expect((await stored(id))?.status).toBe("PENDENTE");
  });

  it("não permite saltar etapas em coleta própria (ACEITA → complete)", async () => {
    const id = await newPendingId();
    await coletorA.post(`/api/v1/collections/${id}/accept`).expect(200);

    const response = await coletorA.post(`/api/v1/collections/${id}/complete`);

    expect(response.status).toBe(422);
    expect(response.body.error.fields).toEqual({ currentStatus: "ACEITA", requestedStatus: "CONCLUIDA" });
  });

  it("repetir uma ação concluída não altera status nem timestamp (idempotência)", async () => {
    const id = await newPendingId();
    await coletorA.post(`/api/v1/collections/${id}/accept`).expect(200);
    await coletorA.post(`/api/v1/collections/${id}/start`).expect(200);
    const before = await stored(id);

    const repeat = await coletorA.post(`/api/v1/collections/${id}/start`);

    expect(repeat.status).toBe(422);
    const after = await stored(id);
    expect(after?.status).toBe("A_CAMINHO");
    expect(after?.startedAt?.getTime()).toBe(before?.startedAt?.getTime());
  });

  it("CONCLUIDA não aceita nenhuma ação (estado terminal)", async () => {
    const id = await newPendingId();
    for (const event of ["accept", "start", "collect", "deliver", "complete"]) {
      await coletorA.post(`/api/v1/collections/${id}/${event}`).expect(200);
    }

    for (const event of ["start", "collect", "deliver", "complete"]) {
      expect((await coletorA.post(`/api/v1/collections/${id}/${event}`)).status).toBe(422);
    }
    expect((await coletorA.post(`/api/v1/collections/${id}/accept`)).status).toBe(409);
  });
});

describe("coletor responsável (17_TESTING §36)", () => {
  it.each(["start", "collect", "deliver", "complete"])("outro coletor recebe 404 em %s e nada muda", async (event) => {
    const id = await newPendingId();
    await coletorA.post(`/api/v1/collections/${id}/accept`).expect(200);

    const response = await coletorB.post(`/api/v1/collections/${id}/${event}`);

    expect(response.status).toBe(404);
    expect((await stored(id))?.status).toBe("ACEITA");
  });

  it("aceitar coleta já aceita por outro coletor responde 409 (DEC-006)", async () => {
    const id = await newPendingId();
    await coletorA.post(`/api/v1/collections/${id}/accept`).expect(200);

    const response = await coletorB.post(`/api/v1/collections/${id}/accept`);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("COLLECTION_ALREADY_ACCEPTED");
    expect(response.body.message).toBe("A coleta já foi aceita por outro coletor.");
    expect(String((await stored(id))?.coletorId)).toBe(coletorAId);
  });

  it("aceitar duas vezes a própria coleta responde 409 sem alterar acceptedAt", async () => {
    const id = await newPendingId();
    await coletorA.post(`/api/v1/collections/${id}/accept`).expect(200);
    const before = await stored(id);

    const response = await coletorA.post(`/api/v1/collections/${id}/accept`);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Você já aceitou esta coleta.");
    expect((await stored(id))?.acceptedAt?.getTime()).toBe(before?.acceptedAt?.getTime());
  });

  it("cliente não executa ações operacionais (17_TESTING §34)", async () => {
    await createUser({ email: "cliente2@teste.local" });
    const cliente = await loginAgent(app, "cliente2@teste.local");
    const id = await newPendingId();

    expect((await cliente.post(`/api/v1/collections/${id}/accept`)).status).toBe(403);
    expect((await stored(id))?.status).toBe("PENDENTE");
  });

  it("ações sem sessão respondem 401; coleta inexistente responde 404", async () => {
    const id = await newPendingId();

    expect((await request(app).post(`/api/v1/collections/${id}/accept`)).status).toBe(401);
    expect((await coletorA.post("/api/v1/collections/000000000000000000000000/accept")).status).toBe(404);
    expect((await coletorA.post("/api/v1/collections/nao-e-um-id/start")).status).toBe(404);
  });
});

describe("entrega sem ecoponto ativo (DEC-053)", () => {
  it("responde 409 ECOPOINT_UNAVAILABLE e não altera a coleta", async () => {
    const id = await newPendingId();
    for (const event of ["accept", "start", "collect"]) {
      await coletorA.post(`/api/v1/collections/${id}/${event}`).expect(200);
    }
    await Ecopoint.updateMany({}, { status: "INATIVO" });

    const response = await coletorA.post(`/api/v1/collections/${id}/deliver`);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("ECOPOINT_UNAVAILABLE");
    const after = await stored(id);
    expect(after?.status).toBe("RECOLHIDA");
    expect(after?.deliveredAt).toBeNull();
    expect(after?.ecopontoId).toBeNull();
  });

  it("sem ecoponto ativo, deliver em estado errado ainda responde 422", async () => {
    const id = await newPendingId();
    await coletorA.post(`/api/v1/collections/${id}/accept`).expect(200);
    await Ecopoint.updateMany({}, { status: "INATIVO" });

    expect((await coletorA.post(`/api/v1/collections/${id}/deliver`)).status).toBe(422);
  });
});

describe("concorrência na aceitação (DEC-006, 17_TESTING §25–§26, 20_SEED_DATA §23)", () => {
  it("dois coletores ao mesmo tempo: exatamente um 200 e um 409", async () => {
    const id = await newPendingId();

    const [first, second] = await Promise.all([
      coletorA.post(`/api/v1/collections/${id}/accept`),
      coletorB.post(`/api/v1/collections/${id}/accept`),
    ]);

    expect([first.status, second.status].sort()).toEqual([200, 409]);
    const winner = first.status === 200 ? first : second;
    const final = await stored(id);
    expect(final?.status).toBe("ACEITA");
    expect(winner.body.data.collection.status).toBe("ACEITA");
  });

  it("dez coletores ao mesmo tempo: somente um assume a coleta", async () => {
    const id = await newPendingId();
    const agents: Agent[] = [];
    for (let index = 0; index < 10; index += 1) {
      await createUser({ email: `coletor${index}@teste.local`, role: "COLETOR" });
      agents.push(await loginAgent(app, `coletor${index}@teste.local`));
    }

    const responses = await Promise.all(agents.map((agent) => agent.post(`/api/v1/collections/${id}/accept`)));

    expect(responses.filter((response) => response.status === 200)).toHaveLength(1);
    expect(responses.filter((response) => response.status === 409)).toHaveLength(9);

    const final = await stored(id);
    const winners = await User.find({ _id: final?.coletorId });
    expect(winners).toHaveLength(1);
    expect(findCollectionInvariantViolations(final as unknown as CollectionSnapshot)).toEqual([]);
  });
});
