import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { Collection } from "../../src/models/index.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const enderecoColeta = {
  logradouro: "Rua Exemplo",
  numero: "100",
  bairro: "Centro",
  cidade: "Diadema",
  estado: "SP",
  cep: "09900000",
};

function newCollection(overrides: Record<string, unknown> = {}) {
  return {
    usuarioId: new Types.ObjectId(),
    enderecoColeta,
    itensDescarte: [{ categoria: "INFORMATICA", quantidade: 1, condicao: "USADO" }],
    ...overrides,
  };
}

describe("Collection model", () => {
  it("cria no estado inicial PENDENTE, sem coletor, ecoponto ou timestamps do ciclo (BR-017)", async () => {
    const collection = await Collection.create(newCollection());

    expect(collection.status).toBe("PENDENTE");
    expect(collection.coletorId).toBeNull();
    expect(collection.ecopontoId).toBeNull();
    expect(collection.acceptedAt).toBeNull();
    expect(collection.completedAt).toBeNull();
    expect(collection.dataAgendada).toBeNull();
    expect(collection.enderecoColeta.localizacao).toBeNull();
  });

  it("exige usuarioId e endereço", async () => {
    await expect(Collection.create(newCollection({ usuarioId: undefined }))).rejects.toThrow(/usuarioId é obrigatório/);
    await expect(Collection.create(newCollection({ enderecoColeta: undefined }))).rejects.toThrow(
      /enderecoColeta é obrigatório/,
    );
  });

  it("exige pelo menos um item de descarte (BR-014)", async () => {
    await expect(Collection.create(newCollection({ itensDescarte: [] }))).rejects.toThrow(/pelo menos um item/);
  });

  it("exige categoria, quantidade e condicao em cada item (17_TESTING §60)", async () => {
    await expect(
      Collection.create(newCollection({ itensDescarte: [{ categoria: "CABOS", quantidade: 1 }] })),
    ).rejects.toThrow(/condicao é obrigatória/);
    await expect(
      Collection.create(newCollection({ itensDescarte: [{ quantidade: 1, condicao: "USADO" }] })),
    ).rejects.toThrow(/categoria é obrigatória/);
  });

  it.each([0, -3])("rejeita quantidade %s (deve ser maior que zero)", async (quantidade) => {
    await expect(
      Collection.create(newCollection({ itensDescarte: [{ categoria: "CABOS", quantidade, condicao: "USADO" }] })),
    ).rejects.toThrow(/quantidade deve ser maior que zero/);
  });

  it("normaliza categoria e condicao em maiúsculas (OQ-007, OQ-010)", async () => {
    const collection = await Collection.create(
      newCollection({ itensDescarte: [{ categoria: " celulares ", quantidade: 2, condicao: "danificado" }] }),
    );

    expect(collection.itensDescarte[0]).toMatchObject({ categoria: "CELULARES", condicao: "DANIFICADO" });
  });

  it("valida CEP com 8 dígitos e UF com 2 letras", async () => {
    await expect(
      Collection.create(newCollection({ enderecoColeta: { ...enderecoColeta, cep: "09900-000" } })),
    ).rejects.toThrow(/cep deve conter 8 dígitos/);
    await expect(
      Collection.create(newCollection({ enderecoColeta: { ...enderecoColeta, estado: "São Paulo" } })),
    ).rejects.toThrow(/estado deve ser a sigla/);
  });

  it("aceita localização GeoJSON [longitude, latitude] e rejeita coordenadas invertidas fora do limite", async () => {
    const collection = await Collection.create(
      newCollection({
        enderecoColeta: { ...enderecoColeta, localizacao: { type: "Point", coordinates: [-46.62, -23.68] } },
      }),
    );
    expect(collection.enderecoColeta.localizacao?.coordinates).toEqual([-46.62, -23.68]);

    await expect(
      Collection.create(
        newCollection({
          enderecoColeta: { ...enderecoColeta, localizacao: { type: "Point", coordinates: [-23.68, -146.62] } },
        }),
      ),
    ).rejects.toThrow(/\[longitude, latitude\]/);
  });

  it("rejeita status fora da máquina de estados (BR-016)", async () => {
    await expect(Collection.create(newCollection({ status: "CANCELADA" }))).rejects.toThrow(/status inválido/);
  });

  it("rejeita documento incoerente: PENDENTE com coletor", async () => {
    await expect(Collection.create(newCollection({ coletorId: new Types.ObjectId() }))).rejects.toThrow(
      /coletorId deve ser nulo no status PENDENTE/,
    );
  });

  it("rejeita documento incoerente: ACEITA sem coletor e sem acceptedAt", async () => {
    await expect(Collection.create(newCollection({ status: "ACEITA" }))).rejects.toThrow(
      /coletorId é obrigatório no status ACEITA.*acceptedAt é obrigatório no status ACEITA/,
    );
  });

  it("aceita documento coerente em CONCLUIDA", async () => {
    const createdAt = new Date("2026-09-20T10:00:00.000Z");
    const step = (n: number) => new Date(createdAt.getTime() + n * 60_000);

    const collection = await Collection.create(
      newCollection({
        status: "CONCLUIDA",
        coletorId: new Types.ObjectId(),
        ecopontoId: new Types.ObjectId(),
        createdAt,
        acceptedAt: step(1),
        startedAt: step(2),
        collectedAt: step(3),
        deliveredAt: step(4),
        completedAt: step(5),
      }),
    );

    expect(collection.status).toBe("CONCLUIDA");
  });

  it("expõe id no JSON e mantém o endereço embutido como snapshot (DEC-008)", async () => {
    const collection = await Collection.create(newCollection());
    const json = collection.toJSON() as Record<string, unknown>;

    expect(json.id).toBe(String(collection._id));
    expect(json).not.toHaveProperty("_id");
    expect(json.enderecoColeta).toMatchObject(enderecoColeta);
  });

  it("possui os índices de status, cliente e coletor (17_TESTING §63)", async () => {
    const keys = (await Collection.listIndexes()).map((index) => index.key);

    expect(keys).toContainEqual({ status: 1, createdAt: -1 });
    expect(keys).toContainEqual({ usuarioId: 1, createdAt: -1 });
    expect(keys).toContainEqual({ coletorId: 1, createdAt: -1 });
  });
});
