import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/components/features/auth/auth-provider";
import { ProfileLink } from "@/components/layouts/profile-link";
import type { Profile } from "@/lib/api/profile";
import { buildAdminUser, clienteUser, failure, mockApi, renderWithAuth, success } from "@/test/utils";
import { ProfilePage } from "./profile-page";

const navigation = vi.hoisted(() => ({ pathname: "/cliente/perfil" }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  navigation.pathname = "/cliente/perfil";
});

// Nome do usuário autenticado, como o cabeçalho o exibe.
function CurrentUserName() {
  const { user } = useAuth();
  return <p data-testid="usuario">{user?.nome}</p>;
}

function mockProfileApi(initial: Profile, password?: () => ReturnType<typeof success>) {
  let current = initial;
  return mockApi([
    { path: "/auth/me", response: success({ user: clienteUser }) },
    { path: "/profile", response: () => success({ user: current }) },
    {
      method: "PATCH",
      path: "/profile",
      response: (body) => {
        current = { ...current, ...(body as Partial<Profile>) };
        return success({ user: current }, "Perfil atualizado.");
      },
    },
    { method: "PATCH", path: "/profile/password", response: password ?? (() => success(null, "Senha alterada com sucesso.")) },
  ]);
}

function renderPage() {
  return renderWithAuth(
    <>
      <CurrentUserName />
      <ProfilePage />
    </>,
  );
}

describe("ProfilePage — dados (RF-011, RF-012, DEC-078)", () => {
  it("mostra os dados fixos e só os campos editáveis de PF", async () => {
    mockProfileApi(buildAdminUser({ nome: "Mariana Oliveira" }));
    renderPage();

    const conta = await screen.findByRole("region", { name: "Conta" });
    expect(within(conta).getByText("mariana@ecobyte.local")).toBeInTheDocument();
    expect(within(conta).getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nome/)).toHaveValue("Mariana Oliveira");
    expect(screen.getByLabelText(/^Telefone/)).toHaveValue("11987654321");
    expect(screen.queryByLabelText(/Razão social/)).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /E-mail/ })).not.toBeInTheDocument();
  });

  it("salva nome e telefone e atualiza o usuário exibido no cabeçalho", async () => {
    const user = userEvent.setup();
    const { calls } = mockProfileApi(buildAdminUser({ nome: "Mariana Oliveira" }));
    renderPage();

    const nome = await screen.findByLabelText(/^Nome/);
    await user.clear(nome);
    await user.type(nome, "Mariana Souza");
    await user.clear(screen.getByLabelText(/^Telefone/));
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Perfil atualizado.");
    expect(calls.find((call) => call.method === "PATCH" && call.path === "/api/v1/profile")?.body).toEqual({
      nome: "Mariana Souza",
      telefone: null,
    });
    expect(screen.getByTestId("usuario")).toHaveTextContent("Mariana Souza");
  });

  it("PJ edita razão social e nome fantasia", async () => {
    const user = userEvent.setup();
    const { calls } = mockProfileApi(
      buildAdminUser({ tipoCadastro: "PJ", dadosEmpresa: { razaoSocial: "Tech Verde Ltda.", nomeFantasia: null } }),
    );
    renderPage();

    await user.type(await screen.findByLabelText(/^Nome fantasia/), "Tech Verde");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await screen.findByRole("status");
    expect(calls.find((call) => call.method === "PATCH")?.body).toMatchObject({
      dadosEmpresa: { razaoSocial: "Tech Verde Ltda.", nomeFantasia: "Tech Verde" },
    });
  });

  it("razão social é obrigatória para PJ", async () => {
    const user = userEvent.setup();
    const { calls } = mockProfileApi(
      buildAdminUser({ tipoCadastro: "PJ", dadosEmpresa: { razaoSocial: "Tech Verde Ltda.", nomeFantasia: null } }),
    );
    renderPage();

    await user.clear(await screen.findByLabelText(/^Razão social/));
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByText("Informe a razão social.")).toBeInTheDocument();
    expect(calls.some((call) => call.method === "PATCH")).toBe(false);
  });
});

describe("ProfilePage — senha (DEC-078)", () => {
  async function fillPasswords(user: ReturnType<typeof userEvent.setup>, current: string) {
    await user.type(await screen.findByLabelText(/^Senha atual/), current);
    await user.type(screen.getByLabelText(/^Nova senha/), "NovaSenha@456");
    await user.type(screen.getByLabelText(/^Confirmar nova senha/), "NovaSenha@456");
    await user.click(screen.getByRole("button", { name: "Alterar senha" }));
  }

  it("altera a senha e limpa o formulário", async () => {
    const user = userEvent.setup();
    const { calls } = mockProfileApi(buildAdminUser());
    renderPage();

    await fillPasswords(user, "Senha@123");

    const alerts = await screen.findAllByRole("status");
    expect(alerts.some((alert) => alert.textContent?.includes("Senha alterada com sucesso."))).toBe(true);
    expect(calls.find((call) => call.path === "/api/v1/profile/password")?.body).toEqual({
      senhaAtual: "Senha@123",
      novaSenha: "NovaSenha@456",
      confirmacaoNovaSenha: "NovaSenha@456",
    });
    expect(screen.getByLabelText(/^Senha atual/)).toHaveValue("");
  });

  it("senha atual incorreta aparece no próprio campo", async () => {
    const user = userEvent.setup();
    mockProfileApi(buildAdminUser(), () =>
      failure(400, "VALIDATION_ERROR", "Existem campos inválidos.", { senhaAtual: "Senha atual incorreta." }),
    );
    renderPage();

    await fillPasswords(user, "Errada@123");

    expect(await screen.findByText("Senha atual incorreta.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha atual/)).toHaveAttribute("aria-invalid", "true");
  });

  it("valida a nova senha antes de enviar", async () => {
    const user = userEvent.setup();
    const { calls } = mockProfileApi(buildAdminUser());
    renderPage();

    await user.type(await screen.findByLabelText(/^Senha atual/), "Senha@123");
    await user.type(screen.getByLabelText(/^Nova senha/), "fraca");
    await user.click(screen.getByRole("button", { name: "Alterar senha" }));

    expect(await screen.findByText("A senha deve ter pelo menos 8 caracteres.")).toBeInTheDocument();
    expect(calls.some((call) => call.path === "/api/v1/profile/password")).toBe(false);
  });
});

describe("ProfileLink (12 §14)", () => {
  it.each([
    ["CLIENTE", "/cliente/perfil"],
    ["COLETOR", "/coletor/perfil"],
    ["ADMIN", "/admin/perfil"],
  ] as const)("%s → %s, com nome acessível", (role, href) => {
    navigation.pathname = href;
    render(<ProfileLink user={{ ...clienteUser, role }} />);

    const link = screen.getByRole("link", { name: "Meu perfil: Mariana Oliveira" });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("aria-current", "page");
  });
});
