import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAuditLog } from "@/components/features/admin/admin-audit-log";
import { RegistrationForm } from "@/components/features/auth/registration-form";
import { clienteUser, failure, mockApi, renderWithAuth, renderWithQuery, success } from "@/test/utils";
import { PrivacySection } from "./privacy-section";

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/cliente/perfil",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: navigation.replace }),
}));

beforeEach(() => {
  navigation.replace.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const me = { path: "/auth/me", response: success({ user: clienteUser }) };

describe("Seus dados — baixar meus dados (DEC-095)", () => {
  it("baixa o JSON vindo da API como arquivo", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:ecobyte");
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    mockApi([me, { path: "/profile/export", response: success({ titular: { nome: "Mariana" } }, "Dados exportados.") }]);
    renderWithAuth(<PrivacySection canDelete />);

    await user.click(screen.getByRole("button", { name: "Baixar meus dados" }));

    await vi.waitFor(() => expect(click).toHaveBeenCalledOnce());
    const blob = createObjectURL.mock.calls[0]![0];
    expect(JSON.parse(await blob.text())).toEqual({ titular: { nome: "Mariana" } });
    expect((click.mock.instances[0] as unknown as HTMLAnchorElement).download).toBe("ecobyte-meus-dados.json");
  });
});

describe("Seus dados — excluir minha conta (DEC-095)", () => {
  async function openAndConfirm(user: ReturnType<typeof userEvent.setup>, senha: string) {
    await user.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.type(within(dialog).getByLabelText(/^Confirme com a sua senha/), senha);
    await user.click(within(dialog).getByRole("button", { name: "Excluir conta" }));
    return dialog;
  }

  it("pede a senha, exclui e leva ao login com o aviso", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([
      me,
      { method: "DELETE", path: "/profile", response: success(null, "Conta excluída. Seus dados pessoais foram removidos.") },
    ]);
    renderWithAuth(<PrivacySection canDelete />);

    await openAndConfirm(user, "Senha@123");

    await vi.waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/entrar?conta=excluida"));
    expect(calls.find((call) => call.method === "DELETE")?.body).toEqual({ senha: "Senha@123" });
  });

  it("senha errada aparece no campo, sem fechar o diálogo", async () => {
    const user = userEvent.setup();
    mockApi([
      me,
      {
        method: "DELETE",
        path: "/profile",
        response: failure(400, "VALIDATION_ERROR", "Existem campos inválidos.", { senha: "Senha incorreta." }),
      },
    ]);
    renderWithAuth(<PrivacySection canDelete />);

    const dialog = await openAndConfirm(user, "Errada@1");

    expect(await within(dialog).findByText("Senha incorreta.")).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("coletas em andamento: mostra a explicação da API", async () => {
    const user = userEvent.setup();
    const message = "Você tem coletas em andamento. A exclusão fica disponível quando todas forem concluídas.";
    mockApi([me, { method: "DELETE", path: "/profile", response: failure(409, "USER_HAS_ACTIVE_COLLECTIONS", message) }]);
    renderWithAuth(<PrivacySection canDelete />);

    const dialog = await openAndConfirm(user, "Senha@123");

    expect(await within(dialog).findByText(message)).toBeInTheDocument();
  });

  it("o administrador não vê a exclusão", () => {
    mockApi([me]);
    renderWithAuth(<PrivacySection canDelete={false} />);

    expect(screen.queryByRole("button", { name: "Excluir minha conta" })).not.toBeInTheDocument();
    expect(screen.getByText("A conta de administrador não pode ser excluída pelo perfil.")).toBeInTheDocument();
  });
});

describe("Política de Privacidade no cadastro (DEC-095)", () => {
  it("o cadastro informa e leva à política, em nova aba", () => {
    mockApi([{ path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") }]);
    renderWithAuth(<RegistrationForm />);

    const link = screen.getByRole("link", { name: /Política de Privacidade/ });
    expect(link).toHaveAttribute("href", "/privacidade");
    expect(link).toHaveAttribute("target", "_blank");
  });
});

describe("AdminAuditLog (DEC-094)", () => {
  it("lista as ações com quem fez, quando e o alvo", async () => {
    mockApi([
      {
        path: "/admin/audit?page=1&limit=20",
        response: success({
          items: [
            {
              id: "l1",
              acao: "USUARIO_DESATIVADO",
              ator: { id: "a1", role: "ADMIN", nome: "Ana Admin" },
              alvo: { tipo: "USUARIO", id: "u1" },
              detalhes: { status: "INATIVO" },
              createdAt: "2026-10-26T13:00:00.000Z",
            },
            {
              id: "l2",
              acao: "ECOPONTO_ATUALIZADO",
              ator: { id: "a1", role: "ADMIN", nome: "Ana Admin" },
              alvo: { tipo: "ECOPONTO", id: "e1" },
              detalhes: { campos: ["nome", "horarios"] },
              createdAt: "2026-10-26T12:00:00.000Z",
            },
            {
              id: "l3",
              acao: "ADMIN_INICIAL_CRIADO",
              ator: { id: null, role: "SISTEMA", nome: null },
              alvo: { tipo: "USUARIO", id: "a1" },
              detalhes: null,
              createdAt: "2026-10-26T11:00:00.000Z",
            },
          ],
          pagination: { page: 1, limit: 20, total: 3, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        }),
      },
    ]);
    renderWithQuery(<AdminAuditLog />);

    const items = within(await screen.findByRole("list", { name: "Ações registradas" })).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Usuário desativado");
    expect(items[0]).toHaveTextContent("Ana Admin · Administrador");
    expect(within(items[0]!).getByRole("link", { name: "Ver usuário" })).toHaveAttribute("href", "/admin/usuarios/u1");
    expect(items[1]).toHaveTextContent("Campos: nome, horarios");
    expect(within(items[1]!).getByRole("link", { name: "Ecoponto" })).toHaveAttribute("href", "/admin/ecoponto");
    expect(items[2]).toHaveTextContent("Sistema (inicialização)");
  });
});
