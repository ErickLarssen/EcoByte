import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminUser } from "@/lib/api/admin";
import {
  adminUser,
  buildAdminCollection,
  buildAdminUser,
  failure,
  mockApi,
  paginated,
  renderWithAuth,
  renderWithQuery,
  success,
} from "@/test/utils";
import { AdminCollectionDetail } from "./admin-collection-detail";
import { AdminCollectionList } from "./admin-collection-list";
import { AdminDashboard } from "./admin-dashboard";
import { AdminUserDetail } from "./admin-user-detail";
import { AdminUserList } from "./admin-user-list";

const navigation = vi.hoisted(() => ({ search: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  navigation.search = "";
});

describe("AdminUserList (RF-041, 11 §80)", () => {
  it("apresenta os usuários em tabela semântica e em cartões, com link para o detalhe", async () => {
    mockApi([
      {
        path: "/admin/users?page=1&limit=10",
        response: success(
          paginated([
            buildAdminUser({ id: "u1" }),
            buildAdminUser({ id: "u2", nome: "Carlos Mendes", role: "COLETOR", status: "INATIVO" }),
          ]),
        ),
      },
    ]);
    renderWithQuery(<AdminUserList />);

    const table = await screen.findByRole("table", { name: "Usuários cadastrados" });
    expect(within(table).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Nome",
      "Perfil",
      "Tipo",
      "Status",
      "Cadastro",
    ]);
    const carlos = within(table).getByRole("rowheader", { name: /Carlos Mendes/ });
    expect(within(carlos).getByRole("link")).toHaveAttribute("href", "/admin/usuarios/u2");
    const row = carlos.closest("tr")!;
    expect(within(row).getByText("Coletor")).toBeInTheDocument();
    expect(within(row).getByText("Inativo")).toBeInTheDocument();

    // Cartões do celular: mesma informação, mesma ordem (12 §69).
    const cards = screen.getAllByRole("list")[0]!;
    expect(within(cards).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/admin/usuarios/u1",
      "/admin/usuarios/u2",
    ]);
    expect(screen.getByText("2 usuários")).toBeInTheDocument();
  });
});

describe("AdminUserDetail (RF-042, RF-043, DEC-075)", () => {
  function mockUser(initial: AdminUser, patch?: (status: string) => ReturnType<typeof success>) {
    let current = initial;
    return mockApi([
      { path: `/admin/users/${initial.id}`, response: () => success({ user: current }) },
      {
        method: "PATCH",
        path: `/admin/users/${initial.id}/status`,
        response: (body) => {
          const { status } = body as { status: "ATIVO" | "INATIVO" };
          if (patch) return patch(status);
          current = { ...current, status };
          return success({ user: current }, status === "ATIVO" ? "Usuário ativado." : "Usuário desativado.");
        },
      },
    ]);
  }

  it("mostra os dados permitidos", async () => {
    mockUser(buildAdminUser({ tipoCadastro: "PJ", dadosEmpresa: { razaoSocial: "Tech Verde Ltda.", nomeFantasia: null } }));
    renderWithQuery(<AdminUserDetail id="u1" />);

    expect(await screen.findByRole("heading", { name: "Mariana Oliveira" })).toBeInTheDocument();
    expect(screen.getByText("mariana@ecobyte.local")).toBeInTheDocument();
    expect(screen.getByText("Pessoa jurídica")).toBeInTheDocument();
    expect(screen.getByText("Tech Verde Ltda.")).toBeInTheDocument();
    expect(screen.getByText("Não informado")).toBeInTheDocument();
  });

  it("desativa somente após confirmar no diálogo (11 §35)", async () => {
    const user = userEvent.setup();
    const { calls } = mockUser(buildAdminUser());
    renderWithQuery(<AdminUserDetail id="u1" />);

    await user.click(await screen.findByRole("button", { name: "Desativar usuário" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Desativar usuário?" });
    expect(calls.some((call) => call.method === "PATCH")).toBe(false);

    await user.click(within(dialog).getByRole("button", { name: "Desativar" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Usuário desativado.");
    expect(calls.filter((call) => call.method === "PATCH").map((call) => call.body)).toEqual([{ status: "INATIVO" }]);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reativar usuário" })).toBeInTheDocument();
  });

  it("cancelar o diálogo não altera nada", async () => {
    const user = userEvent.setup();
    const { calls } = mockUser(buildAdminUser());
    renderWithQuery(<AdminUserDetail id="u1" />);

    await user.click(await screen.findByRole("button", { name: "Desativar usuário" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(calls.some((call) => call.method === "PATCH")).toBe(false);
  });

  it("reativa um usuário inativo", async () => {
    const user = userEvent.setup();
    const { calls } = mockUser(buildAdminUser({ status: "INATIVO" }));
    renderWithQuery(<AdminUserDetail id="u1" />);

    await user.click(await screen.findByRole("button", { name: "Reativar usuário" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Usuário ativado.");
    expect(calls.find((call) => call.method === "PATCH")?.body).toEqual({ status: "ATIVO" });
  });

  it("mostra a recusa da API para coletor com coletas em andamento", async () => {
    const user = userEvent.setup();
    const message = "O coletor tem 1 coleta em andamento. Ela precisa ser concluída antes da desativação.";
    mockUser(buildAdminUser({ role: "COLETOR" }), () => failure(409, "USER_HAS_ACTIVE_COLLECTIONS", message));
    renderWithQuery(<AdminUserDetail id="u1" />);

    await user.click(await screen.findByRole("button", { name: "Desativar usuário" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Desativar" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível desativar o usuário.");
    expect(alert).toHaveTextContent(message);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("não oferece alterar o status de administradores", async () => {
    mockUser(buildAdminUser({ role: "ADMIN" }));
    renderWithQuery(<AdminUserDetail id="u1" />);

    expect(await screen.findByText("O status de administradores não pode ser alterado.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("404: usuário não encontrado", async () => {
    mockApi([{ path: "/admin/users/x", response: failure(404, "RESOURCE_NOT_FOUND", "Usuário não encontrado.") }]);
    renderWithQuery(<AdminUserDetail id="x" />);

    expect(await screen.findByText("Usuário não encontrado.")).toBeInTheDocument();
  });
});

describe("AdminCollectionList (RF-044, 11 §81)", () => {
  it("filtra por status pela URL e mantém o filtro na paginação", async () => {
    navigation.search = "status=ACEITA&pagina=2";
    const { calls } = mockApi([
      {
        path: "/admin/collections?page=2&limit=10&status=ACEITA",
        response: success(
          paginated(
            [
              buildAdminCollection({
                id: "k1",
                status: "ACEITA",
                coletor: { id: "k9", nome: "Carlos Mendes", email: "carlos@ecobyte.local", telefone: null },
              }),
            ],
            2,
            10,
            21,
          ),
        ),
      },
    ]);
    renderWithQuery(<AdminCollectionList />);

    const table = await screen.findByRole("table", { name: "Coletas" });
    const row = within(table).getByRole("rowheader", { name: /Rua das Palmeiras/ }).closest("tr")!;
    expect(within(row).getByText("Mariana Oliveira")).toBeInTheDocument();
    expect(within(row).getByText("Carlos Mendes")).toBeInTheDocument();
    expect(within(row).getByRole("link")).toHaveAttribute("href", "/admin/coletas/k1");
    expect(calls[0]?.path).toBe("/api/v1/admin/collections?page=2&limit=10&status=ACEITA");

    const filter = screen.getByRole("navigation", { name: "Filtrar por status" });
    expect(within(filter).getByRole("link", { name: "Aceita" })).toHaveAttribute("aria-current", "page");
    expect(within(filter).getByRole("link", { name: "Todas" })).toHaveAttribute("href", "/admin/coletas");
    expect(within(filter).getByRole("link", { name: "Pendente" })).toHaveAttribute("href", "/admin/coletas?status=PENDENTE");

    const pages = screen.getByRole("navigation", { name: "Paginação" });
    expect(within(pages).getByRole("link", { name: /Anterior/ })).toHaveAttribute("href", "/admin/coletas?status=ACEITA");
    expect(within(pages).getByRole("link", { name: /Próxima/ })).toHaveAttribute(
      "href",
      "/admin/coletas?status=ACEITA&pagina=3",
    );
  });

  it("ignora status desconhecido na URL e informa filtro sem resultados", async () => {
    navigation.search = "status=CANCELADA";
    mockApi([{ path: "/admin/collections?page=1&limit=10", response: success(paginated([])) }]);
    renderWithQuery(<AdminCollectionList />);

    expect(await screen.findByText("Nenhum registro encontrado.")).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: "Filtrar por status" })).getByRole("link", { name: "Todas" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

describe("AdminCollectionDetail (RF-045, OQ-055)", () => {
  it("mostra cliente e coletor com link para o usuário, sem ações", async () => {
    mockApi([
      {
        path: "/admin/collections/k1",
        response: success({
          collection: buildAdminCollection({
            id: "k1",
            status: "A_CAMINHO",
            coletor: { id: "k9", nome: "Carlos Mendes", email: "carlos@ecobyte.local", telefone: null },
          }),
        }),
      },
    ]);
    renderWithQuery(<AdminCollectionDetail id="k1" />);

    const cliente = await screen.findByRole("region", { name: "Cliente" });
    expect(within(cliente).getByRole("link", { name: "Mariana Oliveira" })).toHaveAttribute("href", "/admin/usuarios/u1");
    const coletor = screen.getByRole("region", { name: "Coletor responsável" });
    expect(within(coletor).getByRole("link", { name: "Carlos Mendes" })).toHaveAttribute("href", "/admin/usuarios/k9");
    expect(screen.getByRole("list", { name: "Andamento da coleta" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("AdminDashboard (RF-040)", () => {
  it("mostra os totais vindos da API", async () => {
    mockApi([
      { path: "/auth/me", response: success({ user: adminUser }) },
      { path: "/admin/users?page=1&limit=1", response: success(paginated([buildAdminUser()], 1, 1, 7)) },
      { path: "/admin/collections?page=1&limit=1&status=PENDENTE", response: success(paginated([], 1, 1, 2)) },
      {
        path: "/admin/collections?page=1&limit=3",
        response: success(paginated([buildAdminCollection({ id: "k1" })], 1, 3, 6)),
      },
    ]);
    renderWithAuth(<AdminDashboard />);

    expect(await screen.findByRole("link", { name: /Usuários\s*7/ })).toHaveAttribute("href", "/admin/usuarios");
    expect(await screen.findByRole("link", { name: /Coletas\s*6/ })).toHaveAttribute("href", "/admin/coletas");
    expect(await screen.findByRole("link", { name: /Aguardando coletor\s*2/ })).toHaveAttribute(
      "href",
      "/admin/coletas?status=PENDENTE",
    );
    expect(screen.getByRole("link", { name: "Ver todas" })).toBeInTheDocument();
  });
});
