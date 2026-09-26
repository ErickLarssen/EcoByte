import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { Ecopoint, Notification } from "../../src/models/index.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const ecopoint = {
  nome: "Ecoponto Teste",
  endereco: {
    logradouro: "Avenida Teste",
    numero: "1",
    bairro: "Centro",
    cidade: "Diadema",
    estado: "SP",
    cep: "09900000",
  },
  localizacao: { type: "Point" as const, coordinates: [-46.6228, -23.6812] },
};

describe("Ecopoint model", () => {
  it("aplica padrões: ATIVO, sem descrição e horários vazios (OQ-005)", async () => {
    const created = await Ecopoint.create(ecopoint);

    expect(created.status).toBe("ATIVO");
    expect(created.descricao).toBeNull();
    expect(created.horarios).toEqual([]);
  });

  it("rejeita status fora de ATIVO/INATIVO (BR-038)", async () => {
    await expect(Ecopoint.create({ ...ecopoint, status: "FECHADO" } as unknown as typeof ecopoint)).rejects.toThrow(/status inválido/);
  });

  it("possui índice 2dsphere e responde a consultas $near (DEC-012, 17_TESTING §61)", async () => {
    await Ecopoint.create(ecopoint);

    const indexes = await Ecopoint.listIndexes();
    expect(indexes.map((index) => index.key)).toContainEqual({ localizacao: "2dsphere" });

    const nearby = await Ecopoint.find({
      localizacao: {
        $near: {
          $geometry: { type: "Point", coordinates: [-46.62, -23.68] },
          $maxDistance: 5_000,
        },
      },
    });
    expect(nearby).toHaveLength(1);
  });
});

describe("Notification model", () => {
  it("cria não lida, com tipo normalizado e referência opcional (BR-042)", async () => {
    const notification = await Notification.create({
      usuarioId: new Types.ObjectId(),
      tipo: "coleta_aceita",
      titulo: "Coleta aceita",
      mensagem: "Um coletor aceitou a sua coleta.",
    });

    expect(notification.lida).toBe(false);
    expect(notification.tipo).toBe("COLETA_ACEITA");
    expect(notification.referencia).toBeNull();
  });

  it("exige usuarioId, titulo e mensagem", async () => {
    await expect(Notification.create({ tipo: "X" })).rejects.toThrow(
      /usuarioId é obrigatório[\s\S]*titulo é obrigatório|titulo é obrigatório[\s\S]*usuarioId é obrigatório/,
    );
  });

  it("possui índice por usuário e data", async () => {
    const keys = (await Notification.listIndexes()).map((index) => index.key);

    expect(keys).toContainEqual({ usuarioId: 1, createdAt: -1 });
  });
});
