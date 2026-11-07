import request from "supertest";
import type { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import type { CollectionStatus } from "../../src/domain/collection-status.js";
import { Collection } from "../../src/models/index.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { insertActiveEcopoint, validCollectionBody } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const HOUR = 60 * 60 * 1000;

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

type Item = { categoria: string; quantidade: number; condicao: string };

// Coleta direto no banco, com status e timestamps coerentes com o ciclo de vida.
function insertCollection({
  cliente,
  coletor = null,
  status,
  createdAt,
  hours = {},
  itens = [{ categoria: "INFORMATICA", quantidade: 1, condicao: "USADO" }],
  bairro = "Centro",
  ecoponto = null,
}: {
  cliente: Types.ObjectId;
  coletor?: Types.ObjectId | null;
  status: CollectionStatus;
  createdAt: Date;
  // Horas depois da criação em que cada etapa aconteceu.
  hours?: Partial<Record<"acceptedAt" | "startedAt" | "collectedAt" | "deliveredAt" | "completedAt", number>>;
  itens?: Item[];
  bairro?: string;
  // Obrigatório a partir da entrega no ecoponto (DEC-053).
  ecoponto?: Types.ObjectId | null;
}) {
  const at = (h: number | undefined) => (h === undefined ? null : new Date(createdAt.getTime() + h * HOUR));
  return Collection.create({
    usuarioId: cliente,
    coletorId: coletor,
    ecopontoId: ecoponto,
    status,
    enderecoColeta: { ...validCollectionBody.enderecoColeta, bairro },
    itensDescarte: itens,
    createdAt,
    updatedAt: createdAt,
    acceptedAt: at(hours.acceptedAt),
    startedAt: at(hours.startedAt),
    collectedAt: at(hours.collectedAt),
    deliveredAt: at(hours.deliveredAt),
    completedAt: at(hours.completedAt),
  });
}

const ALL_STAGES = { acceptedAt: 2, startedAt: 3, collectedAt: 6, deliveredAt: 10, completedAt: 12 };

async function adminAgent() {
  await createUser({ email: "admin@teste.local", role: "ADMIN" });
  return loginAgent(app, "admin@teste.local");
}

async function scenario() {
  const ana = await createUser({ email: "ana@teste.local", nome: "Ana Cliente" });
  const bia = await createUser({ email: "bia@teste.local", nome: "Bia Cliente" });
  const carlos = await createUser({ email: "carlos@teste.local", role: "COLETOR", nome: "Carlos Coletor" });
  const davi = await createUser({ email: "davi@teste.local", role: "COLETOR", nome: "Davi Coletor" });
  const ecoponto = (await insertActiveEcopoint())._id;

  // Outubro (horário de Diadema). A última, às 23:30 de 31/10, já é 01/11 em UTC.
  await insertCollection({
    cliente: ana._id,
    coletor: carlos._id,
    status: "CONCLUIDA",
    ecoponto,
    createdAt: new Date("2026-10-05T10:00:00-03:00"),
    hours: ALL_STAGES,
    itens: [
      { categoria: "INFORMATICA", quantidade: 3, condicao: "USADO" },
      { categoria: "CELULARES", quantidade: 2, condicao: "DANIFICADO" },
    ],
    bairro: "Centro",
  });
  await insertCollection({
    cliente: bia._id,
    coletor: carlos._id,
    status: "CONCLUIDA",
    ecoponto,
    createdAt: new Date("2026-10-31T23:30:00-03:00"),
    hours: { acceptedAt: 4, startedAt: 5, collectedAt: 8, deliveredAt: 12, completedAt: 16 },
    itens: [{ categoria: "CELULARES", quantidade: 1, condicao: "USADO" }],
    bairro: "Eldorado",
  });

  // Novembro.
  await insertCollection({
    cliente: ana._id,
    coletor: davi._id,
    status: "A_CAMINHO",
    createdAt: new Date("2026-11-03T09:00:00-03:00"),
    hours: { acceptedAt: 1, startedAt: 2 },
    itens: [{ categoria: "INFORMATICA", quantidade: 4, condicao: "FUNCIONANDO" }],
    bairro: "Centro",
  });
  await insertCollection({
    cliente: bia._id,
    status: "PENDENTE",
    createdAt: new Date("2026-11-04T09:00:00-03:00"),
    itens: [{ categoria: "ELETRODOMESTICOS", quantidade: 1, condicao: "DANIFICADO" }],
    bairro: "Serraria",
  });
}

describe("GET /api/v1/admin/reports (RF-046, DEC-098)", () => {
  it("calcula os indicadores com as agregações do MongoDB", async () => {
    await scenario();
    const agent = await adminAgent();

    const response = await agent.get("/api/v1/admin/reports");

    expect(response.status).toBe(200);
    const data = response.body.data;
    expect(data.periodo).toEqual({ inicio: null, fim: null });
    expect(data.resumo).toEqual({
      totalColetas: 4,
      concluidas: 2,
      emAndamento: 1,
      pendentes: 1,
      itensSolicitados: 11,
      itensRecolhidos: 6,
      clientesAtendidos: 2,
    });
    expect(data.porStatus).toEqual([
      { status: "PENDENTE", total: 1 },
      { status: "ACEITA", total: 0 },
      { status: "A_CAMINHO", total: 1 },
      { status: "RECOLHIDA", total: 0 },
      { status: "ENTREGUE_ECOPONTO", total: 0 },
      { status: "CONCLUIDA", total: 2 },
    ]);
    // A coleta das 23:30 de 31/10 conta em outubro; ela foi concluída em 01/11.
    expect(data.porMes).toEqual([
      { ano: 2026, mes: 10, solicitadas: 2, concluidas: 1 },
      { ano: 2026, mes: 11, solicitadas: 2, concluidas: 1 },
    ]);
    expect(data.porCategoria).toEqual([
      { categoria: "INFORMATICA", quantidade: 7, coletas: 2 },
      { categoria: "CELULARES", quantidade: 3, coletas: 2 },
      { categoria: "ELETRODOMESTICOS", quantidade: 1, coletas: 1 },
    ]);
    expect(data.porCondicao).toEqual([
      { condicao: "FUNCIONANDO", quantidade: 4 },
      { condicao: "USADO", quantidade: 4 },
      { condicao: "DANIFICADO", quantidade: 3 },
    ]);
    expect(data.porBairro).toEqual([
      { bairro: "Centro", total: 2 },
      { bairro: "Eldorado", total: 1 },
      { bairro: "Serraria", total: 1 },
    ]);
    expect(data.porColetor.map((row: { coletor: { nome: string } }) => row.coletor.nome)).toEqual([
      "Carlos Coletor",
      "Davi Coletor",
    ]);
    expect(data.porColetor[0]).toMatchObject({ atendidas: 2, concluidas: 2 });
    expect(data.porColetor[1]).toMatchObject({ atendidas: 1, concluidas: 0 });
    // Médias: aceite (2h, 4h, 1h) = 2,3h; recolhimento (4h, 4h) = 4h;
    // entrega (4h, 4h) = 4h; total (12h, 16h) = 14h.
    expect(data.temposMedios).toEqual({
      ateAceite: { horas: 2.3, coletas: 3 },
      ateRecolhimento: { horas: 4, coletas: 2 },
      ateEntrega: { horas: 4, coletas: 2 },
      total: { horas: 14, coletas: 2 },
    });
  });

  it("filtra pelo período da solicitação, com o fim inclusivo", async () => {
    await scenario();
    const agent = await adminAgent();

    const october = await agent.get("/api/v1/admin/reports?inicio=2026-10-01&fim=2026-10-31");

    expect(october.status).toBe(200);
    expect(october.body.data.periodo).toEqual({ inicio: "2026-10-01", fim: "2026-10-31" });
    // Inclui a coleta das 23:30 do último dia.
    expect(october.body.data.resumo.totalColetas).toBe(2);
    expect(october.body.data.resumo.pendentes).toBe(0);

    const november = await agent.get("/api/v1/admin/reports?inicio=2026-11-01");
    expect(november.body.data.resumo.totalColetas).toBe(2);
  });

  it("sem coletas, responde zeros e listas vazias", async () => {
    const agent = await adminAgent();

    const data = (await agent.get("/api/v1/admin/reports")).body.data;

    expect(data.resumo.totalColetas).toBe(0);
    expect(data.porStatus.every((row: { total: number }) => row.total === 0)).toBe(true);
    expect(data.porMes).toEqual([]);
    expect(data.temposMedios.total).toEqual({ horas: null, coletas: 0 });
  });

  it("valida o período", async () => {
    const agent = await adminAgent();

    const invalid = await agent.get("/api/v1/admin/reports?inicio=2026-02-30");
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.fields.inicio).toBe("inicio não é uma data válida.");

    const reversed = await agent.get("/api/v1/admin/reports?inicio=2026-11-10&fim=2026-11-01");
    expect(reversed.body.error.fields.fim).toBe("fim deve ser igual ou posterior a inicio.");

    const format = await agent.get("/api/v1/admin/reports?fim=01/11/2026");
    expect(format.body.error.fields.fim).toBe("fim deve estar no formato AAAA-MM-DD.");
  });

  it("só o administrador acessa", async () => {
    await createUser({ email: "cliente@teste.local" });
    const client = await loginAgent(app, "cliente@teste.local");

    expect((await request(app).get("/api/v1/admin/reports")).status).toBe(401);
    expect((await client.get("/api/v1/admin/reports")).status).toBe(403);
  });
});
