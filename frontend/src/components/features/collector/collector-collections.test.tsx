import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CollectionActions } from "@/components/domain/collection-actions";
import type { CollectorCollection, CollectorEvent } from "@/lib/api/collections";
import type { CollectionStatus } from "@/lib/collection-status";
import {
  buildCollectorCollection,
  coletorUser,
  failure,
  mockApi,
  paginated,
  renderWithAuth,
  renderWithQuery,
  success,
} from "@/test/utils";
import { CollectorCollectionDetail } from "./collector-collection-detail";
import { CollectorCollectionList } from "./collector-collection-list";
import { CollectorDashboard } from "./collector-dashboard";

const navigation = vi.hoisted(() => ({ search: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  navigation.search = "";
});

const cliente = { nome: "Mariana Oliveira", telefone: "11987654321" };

// Transições e mensagens da API (14 §19–§25, collection.controller).
const TRANSITIONS: Record<CollectorEvent, { from: CollectionStatus; to: CollectionStatus; field: keyof CollectorCollection; message: string }> = {
  accept: { from: "PENDENTE", to: "ACEITA", field: "acceptedAt", message: "Coleta aceita." },
  start: { from: "ACEITA", to: "A_CAMINHO", field: "startedAt", message: "Rota iniciada." },
  collect: { from: "A_CAMINHO", to: "RECOLHIDA", field: "collectedAt", message: "Recolhimento confirmado." },
  deliver: { from: "RECOLHIDA", to: "ENTREGUE_ECOPONTO", field: "deliveredAt", message: "Entrega no ecoponto registrada." },
  complete: { from: "ENTREGUE_ECOPONTO", to: "CONCLUIDA", field: "completedAt", message: "Coleta concluída." },
};

// API simulada com estado: cada ação avança a coleta, como o backend.
function mockCollectorApi(initial: CollectorCollection) {
  let current = initial;
  const routes = (Object.keys(TRANSITIONS) as CollectorEvent[]).map((event) => ({
    method: "POST",
    path: `/collections/${initial.id}/${event}`,
    response: () => {
      const transition = TRANSITIONS[event];
      if (current.status !== transition.from) {
        return failure(422, "INVALID_STATUS_TRANSITION", "Transição de status inválida.");
      }
      current = { ...current, status: transition.to, [transition.field]: "2026-09-28T13:00:00.000Z", cliente };
      return success({ collection: current }, transition.message);
    },
  }));

  return mockApi([{ path: `/collections/${initial.id}`, response: () => success({ collection: current }) }, ...routes]);
}

describe("CollectorCollectionList — disponíveis e atribuídas (13 §8, §38)", () => {
  it("lista as disponíveis com a próxima ação e link para o detalhe", async () => {
    mockApi([
      {
        path: "/collections/available?page=1&limit=10",
        response: success(paginated([buildCollectorCollection({ id: "d1" }), buildCollectorCollection({ id: "d2" })])),
      },
    ]);
    renderWithQuery(<CollectorCollectionList variant="available" />);

    const list = await screen.findByRole("list");
    const cards = within(list).getAllByRole("link");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute("href", "/coletor/coletas/d1");
    expect(within(cards[0]!).getByText("Aceitar coleta")).toBeInTheDocument();
    expect(screen.getByText("2 coletas disponíveis")).toBeInTheDocument();
  });

  it("sem coletas disponíveis, não sugere erro (10 §98)", async () => {
    mockApi([{ path: "/collections/available?page=1&limit=10", response: success(paginated([])) }]);
    renderWithQuery(<CollectorCollectionList variant="available" />);

    expect(await screen.findByText("Nenhuma coleta disponível no momento.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("atribuídas: mostra a próxima ação de cada status e pagina pela URL", async () => {
    navigation.search = "pagina=2";
    mockApi([
      {
        path: "/collections/assigned?page=2&limit=10",
        response: success(
          paginated(
            [
              buildCollectorCollection({ id: "a1", status: "A_CAMINHO", cliente }),
              buildCollectorCollection({ id: "a2", status: "CONCLUIDA", cliente }),
            ],
            2,
            10,
            12,
          ),
        ),
      },
    ]);
    renderWithQuery(<CollectorCollectionList variant="assigned" />);

    const cards = within(await screen.findByRole("list")).getAllByRole("link");
    expect(within(cards[0]!).getByText("Confirmar recolhimento")).toBeInTheDocument();
    expect(within(cards[1]!).queryByText(/Próxima ação/)).not.toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Paginação" });
    expect(within(nav).getByRole("link", { name: /Anterior/ })).toHaveAttribute("href", "/coletor/coletas?pagina=1");
  });

  it("atribuídas vazias levam às disponíveis", async () => {
    mockApi([{ path: "/collections/assigned?page=1&limit=10", response: success(paginated([])) }]);
    renderWithQuery(<CollectorCollectionList variant="assigned" />);

    expect(await screen.findByText("Você ainda não aceitou nenhuma coleta.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver coletas disponíveis" })).toHaveAttribute("href", "/coletor/disponiveis");
  });
});

describe("CollectorDashboard (13 §43)", () => {
  it("mostra os totais vindos da API", async () => {
    mockApi([
      { path: "/auth/me", response: success({ user: coletorUser }) },
      {
        path: "/collections/available?page=1&limit=3",
        response: success(paginated([buildCollectorCollection({ id: "d1" })], 1, 3, 12)),
      },
      {
        path: "/collections/assigned?page=1&limit=3",
        response: success(paginated([buildCollectorCollection({ id: "a1", status: "ACEITA", cliente })], 1, 3, 2)),
      },
    ]);
    renderWithAuth(<CollectorDashboard />);

    const availableTile = await screen.findByRole("link", { name: /Coletas disponíveis\s*12/ });
    expect(availableTile).toHaveAttribute("href", "/coletor/disponiveis");
    expect(screen.getByRole("link", { name: /Atribuídas a você\s*2/ })).toHaveAttribute("href", "/coletor/coletas");
    expect(await screen.findByRole("heading", { name: "Olá, Carlos!" })).toBeInTheDocument();
    expect(screen.getByText("Iniciar rota")).toBeInTheDocument();
  });
});

describe("CollectorCollectionDetail — fluxo operacional (13 §94, 17 §92)", () => {
  it("coleta disponível: sem dados do cliente e com 'Aceitar coleta' (DEC-070)", async () => {
    mockCollectorApi(buildCollectorCollection());
    renderWithQuery(<CollectorCollectionDetail id="c1" />);

    expect(await screen.findByRole("button", { name: "Aceitar coleta" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Cliente" })).not.toBeInTheDocument();
    expect(screen.queryByText("Você é o coletor responsável.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Coletas disponíveis" })).toHaveAttribute("href", "/coletor/disponiveis");
    // Uma única ação operacional por vez (13 §65).
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("aceitar → iniciar → recolher → entregar → concluir, sempre após a confirmação da API", async () => {
    const user = userEvent.setup();
    const { calls } = mockCollectorApi(buildCollectorCollection());
    renderWithQuery(<CollectorCollectionDetail id="c1" />);

    const steps: Array<[string, string, string]> = [
      ["Aceitar coleta", "Coleta aceita.", "Aceita"],
      ["Iniciar rota", "Rota iniciada.", "A caminho"],
      ["Confirmar recolhimento", "Recolhimento confirmado.", "Recolhida"],
      ["Confirmar entrega no ecoponto", "Entrega no ecoponto registrada.", "Entregue no ecoponto"],
      ["Concluir coleta", "Coleta concluída.", "Concluída"],
    ];

    for (const [button, message, badge] of steps) {
      await user.click(await screen.findByRole("button", { name: button }));
      expect(await screen.findByRole("status")).toHaveTextContent(message);
      expect(within(screen.getByRole("heading", { name: "Coleta" }).parentElement!).getByText(badge)).toBeInTheDocument();
    }

    expect(calls.filter((call) => call.method === "POST").map((call) => call.path)).toEqual([
      "/api/v1/collections/c1/accept",
      "/api/v1/collections/c1/start",
      "/api/v1/collections/c1/collect",
      "/api/v1/collections/c1/deliver",
      "/api/v1/collections/c1/complete",
    ]);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Operação encerrada. Não há mais ações para esta coleta.")).toBeInTheDocument();
    expect(screen.getByText("Você é o coletor responsável.")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Cliente" })).getByText("Mariana Oliveira")).toBeInTheDocument();
  });

  it("aceite concorrente (409): informa, remove a ação e preserva o estado (13 §60)", async () => {
    const user = userEvent.setup();
    mockApi([
      { path: "/collections/c1", response: success({ collection: buildCollectorCollection() }) },
      {
        method: "POST",
        path: "/collections/c1/accept",
        response: failure(409, "COLLECTION_ALREADY_ACCEPTED", "A coleta já foi aceita por outro coletor."),
      },
    ]);
    renderWithQuery(<CollectorCollectionDetail id="c1" />);

    await user.click(await screen.findByRole("button", { name: "Aceitar coleta" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível aceitar esta coleta.");
    expect(alert).toHaveTextContent("A coleta já foi aceita por outro coletor.");
    expect(screen.queryByRole("button", { name: "Aceitar coleta" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Ver coletas disponíveis" })[0]).toHaveAttribute("href", "/coletor/disponiveis");
    expect(screen.getAllByText("Pendente").length).toBeGreaterThan(0);
  });

  it("transição recusada (422): recarrega a coleta da API (13 §77)", async () => {
    const user = userEvent.setup();
    let reads = 0;
    mockApi([
      {
        path: "/collections/c1",
        response: () => {
          reads += 1;
          const status = reads === 1 ? "ACEITA" : "A_CAMINHO";
          return success({ collection: buildCollectorCollection({ status, cliente }) });
        },
      },
      { method: "POST", path: "/collections/c1/start", response: failure(422, "INVALID_STATUS_TRANSITION", "Transição de status inválida.") },
    ]);
    renderWithQuery(<CollectorCollectionDetail id="c1" />);

    await user.click(await screen.findByRole("button", { name: "Iniciar rota" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("A coleta foi atualizada.");
    expect(await screen.findByRole("button", { name: "Confirmar recolhimento" })).toBeInTheDocument();
    expect(reads).toBe(2);
  });

  it("sem conexão: mostra erro e mantém a ação disponível (13 §75)", async () => {
    const user = userEvent.setup();
    const collection = buildCollectorCollection({ status: "A_CAMINHO", cliente });
    const { fetchMock } = mockApi([{ path: "/collections/c1", response: success({ collection }) }]);
    renderWithQuery(<CollectorCollectionDetail id="c1" />);

    await screen.findByRole("button", { name: "Confirmar recolhimento" });
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await user.click(screen.getByRole("button", { name: "Confirmar recolhimento" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Verifique sua conexão.");
    expect(screen.getByRole("button", { name: "Confirmar recolhimento" })).toBeEnabled();
    expect(screen.getAllByText("A caminho").length).toBeGreaterThan(0);
  });

  it("coleta inexistente ou de outro coletor (404): mensagem apropriada (13 §61–§62)", async () => {
    mockApi([{ path: "/collections/x", response: failure(404, "RESOURCE_NOT_FOUND", "Coleta não encontrada.") }]);
    renderWithQuery(<CollectorCollectionDetail id="x" />);

    expect(await screen.findByText("Coleta não encontrada.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tentar novamente/ })).not.toBeInTheDocument();
  });
});

describe("CollectionActions (11 §56)", () => {
  it("em processamento: texto de progresso e botão desabilitado (13 §56–§57)", () => {
    render(<CollectionActions status="PENDENTE" pending onAction={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Aceitando..." })).toBeDisabled();
  });

  it("CONCLUIDA não apresenta ação", () => {
    const { container } = render(<CollectionActions status="CONCLUIDA" onAction={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
