import { describe, expect, it } from "vitest";
import { ApiError } from "./api/client";
import { COLLECTION_STATUSES } from "./collection-status";
import { NEXT_ACTION, describeActionFailure } from "./collector-actions";

describe("próxima ação do coletor (13 §36)", () => {
  it.each([
    ["PENDENTE", "accept", "Aceitar coleta"],
    ["ACEITA", "start", "Iniciar rota"],
    ["A_CAMINHO", "collect", "Confirmar recolhimento"],
    ["RECOLHIDA", "deliver", "Confirmar entrega no ecoponto"],
    ["ENTREGUE_ECOPONTO", "complete", "Concluir coleta"],
  ] as const)("%s → %s (%s)", (status, event, label) => {
    expect(NEXT_ACTION[status]).toMatchObject({ event, label });
  });

  it("CONCLUIDA não tem ação (13 §32)", () => {
    expect(NEXT_ACTION.CONCLUIDA).toBeNull();
  });

  it("cada status tem no máximo uma ação, seguindo a ordem da máquina de estados (13 §34)", () => {
    const events = COLLECTION_STATUSES.map((status) => NEXT_ACTION[status]?.event ?? null);
    expect(events).toEqual(["accept", "start", "collect", "deliver", "complete", null]);
  });
});

describe("describeActionFailure (13 §59–§62)", () => {
  it("aceite concorrente: usa a mensagem da API e tira a coleta de disponíveis", () => {
    const error = new ApiError(409, "COLLECTION_ALREADY_ACCEPTED", "A coleta já foi aceita por outro coletor.");
    expect(describeActionFailure("accept", error)).toEqual({
      title: "Não foi possível aceitar esta coleta.",
      description: "A coleta já foi aceita por outro coletor.",
      unavailable: true,
      resync: false,
    });
  });

  it("404 (inclui coleta de outro coletor): indisponível, sem revelar o motivo", () => {
    const failure = describeActionFailure("start", new ApiError(404, "RESOURCE_NOT_FOUND", "Coleta não encontrada."));
    expect(failure).toMatchObject({ title: "Não foi possível iniciar a rota.", unavailable: true });
  });

  it.each(["INVALID_STATUS_TRANSITION", "CONFLICT"])("%s: pede nova leitura da API (13 §77)", (code) => {
    const failure = describeActionFailure("collect", new ApiError(code === "CONFLICT" ? 409 : 422, code, "x"));
    expect(failure).toMatchObject({ resync: true, unavailable: false });
  });

  it("sem conexão ou ecoponto indisponível: mensagem da API, estado preservado", () => {
    const network = new ApiError(0, "NETWORK_ERROR", "Não foi possível conectar ao servidor. Verifique sua conexão.");
    expect(describeActionFailure("deliver", network)).toEqual({
      title: "Não foi possível registrar a entrega.",
      description: "Não foi possível conectar ao servidor. Verifique sua conexão.",
      unavailable: false,
      resync: false,
    });

    const ecopoint = new ApiError(409, "ECOPOINT_UNAVAILABLE", "Nenhum ecoponto ativo disponível para receber a entrega.");
    expect(describeActionFailure("deliver", ecopoint)).toMatchObject({ unavailable: false, resync: false });
  });
});
