import { describe, expect, it } from "vitest";
import {
  COLLECTION_EVENTS,
  COLLECTION_STATUSES,
  COLLECTION_TRANSITIONS,
  canTransition,
  isCollectionStatus,
  isTerminalStatus,
  requiredTimestampsFor,
  requiresColetor,
  requiresEcoponto,
  resolveEvent,
  type CollectionEvent,
  type CollectionStatus,
} from "../../src/domain/collection-status.js";

describe("status oficiais (DEC-004)", () => {
  it("possui exatamente os 6 status, na ordem do fluxo", () => {
    expect(COLLECTION_STATUSES).toEqual([
      "PENDENTE",
      "ACEITA",
      "A_CAMINHO",
      "RECOLHIDA",
      "ENTREGUE_ECOPONTO",
      "CONCLUIDA",
    ]);
  });

  it("reconhece somente valores oficiais", () => {
    expect(isCollectionStatus("A_CAMINHO")).toBe(true);
    expect(isCollectionStatus("EM_ROTA")).toBe(false);
    expect(isCollectionStatus("pendente")).toBe(false);
    expect(isCollectionStatus(undefined)).toBe(false);
  });
});

describe("matriz de eventos (17_TESTING §19)", () => {
  const matrix: Array<[CollectionStatus, CollectionEvent, CollectionStatus, string]> = [
    ["PENDENTE", "accept", "ACEITA", "acceptedAt"],
    ["ACEITA", "start", "A_CAMINHO", "startedAt"],
    ["A_CAMINHO", "collect", "RECOLHIDA", "collectedAt"],
    ["RECOLHIDA", "deliver", "ENTREGUE_ECOPONTO", "deliveredAt"],
    ["ENTREGUE_ECOPONTO", "complete", "CONCLUIDA", "completedAt"],
  ];

  it.each(matrix)("%s + %s → %s (preenche %s)", (from, event, to, timestampField) => {
    expect(resolveEvent(from, event)).toEqual({ allowed: true, from, to, timestampField });
  });

  it("cada evento é permitido somente a partir do seu status de origem", () => {
    for (const status of COLLECTION_STATUSES) {
      for (const [event, definition] of Object.entries(COLLECTION_EVENTS)) {
        const resolution = resolveEvent(status, event as CollectionEvent);
        expect(resolution.allowed).toBe(status === definition.from);
      }
    }
  });

  it("informa o status exigido quando o evento é inválido", () => {
    expect(resolveEvent("PENDENTE", "complete")).toEqual({
      allowed: false,
      from: "PENDENTE",
      requiredFrom: "ENTREGUE_ECOPONTO",
      to: "CONCLUIDA",
    });
  });
});

describe("transições", () => {
  it("permite somente o próximo status consecutivo", () => {
    expect(COLLECTION_TRANSITIONS).toEqual({
      PENDENTE: ["ACEITA"],
      ACEITA: ["A_CAMINHO"],
      A_CAMINHO: ["RECOLHIDA"],
      RECOLHIDA: ["ENTREGUE_ECOPONTO"],
      ENTREGUE_ECOPONTO: ["CONCLUIDA"],
      CONCLUIDA: [],
    });
  });

  // Exemplos de 17_TESTING §20 e BR-019/BR-020.
  const invalid: Array<[CollectionStatus, CollectionStatus]> = [
    ["PENDENTE", "A_CAMINHO"],
    ["PENDENTE", "RECOLHIDA"],
    ["PENDENTE", "CONCLUIDA"],
    ["ACEITA", "RECOLHIDA"],
    ["ACEITA", "CONCLUIDA"],
    ["A_CAMINHO", "CONCLUIDA"],
    ["RECOLHIDA", "ACEITA"],
    ["ENTREGUE_ECOPONTO", "RECOLHIDA"],
    ["A_CAMINHO", "ACEITA"],
    ["ACEITA", "PENDENTE"],
  ];

  it.each(invalid)("%s → %s é inválida", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it("não permite permanecer no mesmo status", () => {
    for (const status of COLLECTION_STATUSES) {
      expect(canTransition(status, status)).toBe(false);
    }
  });

  it("CONCLUIDA é o único estado terminal e não aceita nenhuma transição (17_TESTING §21)", () => {
    for (const status of COLLECTION_STATUSES) {
      expect(isTerminalStatus(status)).toBe(status === "CONCLUIDA");
      expect(canTransition("CONCLUIDA", status)).toBe(false);
    }
  });
});

describe("timestamps e responsáveis por status", () => {
  it("define os timestamps obrigatórios de cada status (14_STATE_MACHINE §30)", () => {
    expect(requiredTimestampsFor("PENDENTE")).toEqual([]);
    expect(requiredTimestampsFor("ACEITA")).toEqual(["acceptedAt"]);
    expect(requiredTimestampsFor("A_CAMINHO")).toEqual(["acceptedAt", "startedAt"]);
    expect(requiredTimestampsFor("RECOLHIDA")).toEqual(["acceptedAt", "startedAt", "collectedAt"]);
    expect(requiredTimestampsFor("ENTREGUE_ECOPONTO")).toEqual([
      "acceptedAt",
      "startedAt",
      "collectedAt",
      "deliveredAt",
    ]);
    expect(requiredTimestampsFor("CONCLUIDA")).toEqual([
      "acceptedAt",
      "startedAt",
      "collectedAt",
      "deliveredAt",
      "completedAt",
    ]);
  });

  it("o timestamp de cada evento passa a ser obrigatório no status de destino", () => {
    for (const { to, timestampField } of Object.values(COLLECTION_EVENTS)) {
      expect(requiredTimestampsFor(to)).toContain(timestampField);
    }
  });

  it("exige coletorId a partir de ACEITA (DEC-005)", () => {
    expect(COLLECTION_STATUSES.filter(requiresColetor)).toEqual([
      "ACEITA",
      "A_CAMINHO",
      "RECOLHIDA",
      "ENTREGUE_ECOPONTO",
      "CONCLUIDA",
    ]);
  });

  it("exige ecopontoId somente a partir da entrega (DEC-053)", () => {
    expect(COLLECTION_STATUSES.filter(requiresEcoponto)).toEqual(["ENTREGUE_ECOPONTO", "CONCLUIDA"]);
  });
});
