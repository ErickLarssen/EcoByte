import { describe, expect, it } from "vitest";
import { findCollectionInvariantViolations, type CollectionSnapshot } from "../../src/domain/collection-invariants.js";
import {
  COLLECTION_STATUSES,
  requiredTimestampsFor,
  requiresColetor,
  requiresEcoponto,
  type CollectionStatus,
} from "../../src/domain/collection-status.js";

const base = new Date("2026-09-20T10:00:00.000Z");
const at = (hours: number) => new Date(base.getTime() + hours * 60 * 60 * 1000);

// Coleta coerente em qualquer status: responsáveis e timestamps esperados.
function validSnapshot(status: CollectionStatus): CollectionSnapshot {
  const snapshot: CollectionSnapshot = {
    status,
    coletorId: requiresColetor(status) ? "coletor-1" : null,
    ecopontoId: requiresEcoponto(status) ? "ecoponto-1" : null,
    createdAt: base,
    acceptedAt: null,
    startedAt: null,
    collectedAt: null,
    deliveredAt: null,
    completedAt: null,
  };

  requiredTimestampsFor(status).forEach((field, index) => {
    snapshot[field] = at(index + 1);
  });

  return snapshot;
}

describe("findCollectionInvariantViolations", () => {
  it.each(COLLECTION_STATUSES)("aceita uma coleta coerente em %s", (status) => {
    expect(findCollectionInvariantViolations(validSnapshot(status))).toEqual([]);
  });

  it("rejeita status fora da máquina de estados", () => {
    const violations = findCollectionInvariantViolations({ ...validSnapshot("PENDENTE"), status: "CANCELADA" });

    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("status inválido");
  });

  it("rejeita PENDENTE com coletor (17_TESTING §24)", () => {
    expect(findCollectionInvariantViolations({ ...validSnapshot("PENDENTE"), coletorId: "coletor-1" })).toContain(
      "coletorId deve ser nulo no status PENDENTE.",
    );
  });

  it("rejeita ACEITA sem coletor (17_TESTING §24)", () => {
    expect(findCollectionInvariantViolations({ ...validSnapshot("ACEITA"), coletorId: null })).toContain(
      "coletorId é obrigatório no status ACEITA.",
    );
  });

  it("rejeita ENTREGUE_ECOPONTO sem ecoponto e RECOLHIDA com ecoponto (DEC-053)", () => {
    expect(findCollectionInvariantViolations({ ...validSnapshot("ENTREGUE_ECOPONTO"), ecopontoId: null })).toContain(
      "ecopontoId é obrigatório no status ENTREGUE_ECOPONTO.",
    );
    expect(
      findCollectionInvariantViolations({ ...validSnapshot("RECOLHIDA"), ecopontoId: "ecoponto-1" }),
    ).toContain("ecopontoId deve ser nulo no status RECOLHIDA.");
  });

  it("rejeita PENDENTE com timestamps do ciclo preenchidos (20_SEED_DATA §19)", () => {
    expect(findCollectionInvariantViolations({ ...validSnapshot("PENDENTE"), acceptedAt: at(1) })).toContain(
      "acceptedAt deve ser nulo no status PENDENTE.",
    );
  });

  it("rejeita CONCLUIDA sem o histórico completo", () => {
    expect(findCollectionInvariantViolations({ ...validSnapshot("CONCLUIDA"), collectedAt: null })).toContain(
      "collectedAt é obrigatório no status CONCLUIDA.",
    );
  });

  it("rejeita timestamps fora da ordem temporal (17_TESTING §23)", () => {
    const snapshot = { ...validSnapshot("RECOLHIDA"), startedAt: at(10), collectedAt: at(5) };

    expect(findCollectionInvariantViolations(snapshot)).toContain("collectedAt não pode ser anterior a startedAt.");
  });

  it("rejeita acceptedAt anterior a createdAt", () => {
    const snapshot = { ...validSnapshot("ACEITA"), acceptedAt: at(-1) };

    expect(findCollectionInvariantViolations(snapshot)).toContain("acceptedAt não pode ser anterior a createdAt.");
  });

  it("ignora createdAt ausente (documento ainda não persistido)", () => {
    const { createdAt: _createdAt, ...snapshot } = validSnapshot("A_CAMINHO");

    expect(findCollectionInvariantViolations(snapshot)).toEqual([]);
  });
});
