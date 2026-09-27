import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildCollection, failure, mockApi, paginated, renderWithQuery, success } from "@/test/utils";
import { ClientCollectionDetail } from "./client-collection-detail";
import { ClientCollectionList } from "./client-collection-list";

const navigation = vi.hoisted(() => ({ search: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  navigation.search = "";
});

describe("ClientCollectionList — Minhas coletas (RF-021, 17_TESTING §91)", () => {
  it("lista as coletas com status, endereço e link para o detalhe", async () => {
    mockApi([
      {
        path: "/collections?page=1&limit=10",
        response: success(paginated([buildCollection({ id: "a1", status: "A_CAMINHO" }), buildCollection({ id: "a2" })])),
      },
    ]);
    renderWithQuery(<ClientCollectionList />);

    const list = await screen.findByRole("list");
    const cards = within(list).getAllByRole("link");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute("href", "/cliente/coletas/a1");
    expect(within(cards[0]!).getByText("A caminho")).toBeInTheDocument();
    expect(screen.getByText("2 coletas")).toBeInTheDocument();
  });

  it("mostra estado vazio com ação de solicitar (10 §54)", async () => {
    mockApi([{ path: "/collections?page=1&limit=10", response: success(paginated([])) }]);
    renderWithQuery(<ClientCollectionList />);

    expect(await screen.findByText("Nenhuma coleta encontrada.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Solicitar coleta/ })).toHaveAttribute("href", "/cliente/coletas/nova");
  });

  it("lê a página da URL e navega por links reais (11 §42)", async () => {
    navigation.search = "pagina=2";
    mockApi([
      { path: "/collections?page=2&limit=10", response: success(paginated([buildCollection({ id: "p2" })], 2, 10, 21)) },
    ]);
    renderWithQuery(<ClientCollectionList />);

    const nav = await screen.findByRole("navigation", { name: "Paginação" });
    expect(within(nav).getByText("Página 2 de 3")).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Anterior/ })).toHaveAttribute("href", "/cliente/coletas?pagina=1");
    expect(within(nav).getByRole("link", { name: /Próxima/ })).toHaveAttribute("href", "/cliente/coletas?pagina=3");
  });

  it("trata página inexistente", async () => {
    navigation.search = "pagina=9";
    mockApi([{ path: "/collections?page=9&limit=10", response: success(paginated([], 9, 10, 3)) }]);
    renderWithQuery(<ClientCollectionList />);

    expect(await screen.findByText("Esta página não existe.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para a primeira página" })).toHaveAttribute("href", "/cliente/coletas");
  });

  it("mostra erro com nova tentativa (10 §57)", async () => {
    const user = userEvent.setup();
    let attempts = 0;
    mockApi([
      {
        path: "/collections?page=1&limit=10",
        response: () => {
          attempts += 1;
          return attempts === 1
            ? failure(500, "INTERNAL_SERVER_ERROR", "Não foi possível realizar a operação.")
            : success(paginated([buildCollection()]));
        },
      },
    ]);
    renderWithQuery(<ClientCollectionList />);

    expect(await screen.findByText("Não foi possível carregar suas coletas.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Tentar novamente/ }));

    expect(await screen.findByText("1 coleta")).toBeInTheDocument();
  });
});

describe("ClientCollectionDetail (RF-022, RF-023)", () => {
  it("mostra status, andamento, endereço, itens e dados ausentes de forma consistente", async () => {
    mockApi([{ path: "/collections/c1", response: success({ collection: buildCollection() }) }]);
    renderWithQuery(<ClientCollectionDetail id="c1" />);

    expect(await screen.findByRole("heading", { name: "Coleta" })).toBeInTheDocument();
    expect(screen.getAllByText("Pendente").length).toBeGreaterThan(0);
    expect(screen.getByRole("list", { name: "Andamento da coleta" })).toBeInTheDocument();
    expect(screen.getByText("Rua das Palmeiras, 120 — Casa 2")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Itens de descarte" })).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Não informado")).toBeInTheDocument();
    expect(screen.getByText("Aguardando um coletor aceitar a coleta.")).toBeInTheDocument();
  });

  it("mostra o nome do coletor quando houver", async () => {
    mockApi([
      {
        path: "/collections/c1",
        response: success({
          collection: buildCollection({ status: "ACEITA", acceptedAt: "2026-09-20T14:00:00.000Z", coletor: { nome: "Carlos Mendes" } }),
        }),
      },
    ]);
    renderWithQuery(<ClientCollectionDetail id="c1" />);

    expect(await screen.findByText("Carlos Mendes")).toBeInTheDocument();
  });

  it("confirma o sucesso logo após a criação (11 §68)", async () => {
    navigation.search = "nova=1";
    mockApi([{ path: "/collections/c1", response: success({ collection: buildCollection() }) }]);
    renderWithQuery(<ClientCollectionDetail id="c1" />);

    expect(await screen.findByText("Coleta solicitada com sucesso.")).toBeInTheDocument();
  });

  it("mostra 'não encontrada' para 404, sem opção de tentar novamente", async () => {
    mockApi([{ path: "/collections/outra", response: failure(404, "RESOURCE_NOT_FOUND", "Coleta não encontrada.") }]);
    renderWithQuery(<ClientCollectionDetail id="outra" />);

    expect(await screen.findByText("Coleta não encontrada.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tentar novamente/ })).not.toBeInTheDocument();
  });
});
