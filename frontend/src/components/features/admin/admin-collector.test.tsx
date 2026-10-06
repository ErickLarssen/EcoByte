import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAuth } from "@/components/features/auth/require-auth";
import { CollectorCollectionDetail } from "@/components/features/collector/collector-collection-detail";
import { ChangePasswordRequired } from "@/components/features/profile/change-password-required";
import { AuthLayout } from "@/components/layouts/auth-layout";
import {
  buildAdminUser,
  buildCollectorCollection,
  coletorUser,
  failure,
  mockApi,
  renderWithAuth,
  renderWithQuery,
  success,
} from "@/test/utils";
import { AdminCollectorForm } from "./admin-collector-form";

const navigation = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), pathname: "/coletor" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  navigation.push.mockReset();
  navigation.replace.mockReset();
});

describe("AuthLayout — voltar ao site (DEC-083)", () => {
  it("oferece o link para a página inicial", () => {
    render(
      <AuthLayout title="Entrar">
        <p>Formulário</p>
      </AuthLayout>,
    );

    expect(screen.getByRole("link", { name: "Voltar ao site" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "EcoByte, página inicial" })).toHaveAttribute("href", "/");
  });
});

describe("AdminCollectorForm — cadastro de coletor (DEC-083)", () => {
  async function fill(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^Nome/), "Carlos Coletor");
    await user.type(screen.getByLabelText(/^E-mail/), "carlos@ecobyte.local");
    await user.type(screen.getByLabelText(/^Telefone/), "11988887777");
    await user.type(screen.getByLabelText(/^Senha provisória/), "Provisoria@123");
    await user.type(screen.getByLabelText(/^Confirmar senha provisória/), "Provisoria@123");
  }

  it("envia os dados e abre o detalhe do coletor cadastrado", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([
      {
        method: "POST",
        path: "/admin/users",
        response: success({ user: buildAdminUser({ id: "k7", role: "COLETOR", trocaSenhaObrigatoria: true }) }, "ok", 201),
      },
    ]);
    renderWithQuery(<AdminCollectorForm />);

    await fill(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar coletor" }));

    await vi.waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/admin/usuarios/k7?novo=1"));
    expect(calls.find((call) => call.method === "POST")?.body).toEqual({
      nome: "Carlos Coletor",
      email: "carlos@ecobyte.local",
      telefone: "11988887777",
      senha: "Provisoria@123",
      confirmacaoSenha: "Provisoria@123",
    });
  });

  it("telefone é obrigatório e a senha segue a política", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([]);
    renderWithQuery(<AdminCollectorForm />);

    await user.type(screen.getByLabelText(/^Senha provisória/), "fraca");
    await user.click(screen.getByRole("button", { name: "Cadastrar coletor" }));

    expect(await screen.findByText("Informe o telefone.")).toBeInTheDocument();
    expect(screen.getByText("A senha deve ter pelo menos 8 caracteres.")).toBeInTheDocument();
    expect(calls.some((call) => call.method === "POST")).toBe(false);
  });

  it("mostra a recusa da API no campo (e-mail em uso)", async () => {
    const user = userEvent.setup();
    mockApi([
      {
        method: "POST",
        path: "/admin/users",
        response: failure(409, "EMAIL_ALREADY_EXISTS", "Este e-mail já está cadastrado."),
      },
    ]);
    renderWithQuery(<AdminCollectorForm />);

    await fill(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar coletor" }));

    expect(await screen.findByText("Este e-mail já está cadastrado.")).toBeInTheDocument();
  });
});

describe("senha provisória: troca obrigatória (DEC-083)", () => {
  const provisional = { ...coletorUser, trocaSenhaObrigatoria: true };

  it("a área do coletor redireciona para /trocar-senha", async () => {
    mockApi([{ path: "/auth/me", response: success({ user: provisional }) }]);
    renderWithAuth(
      <RequireAuth role="COLETOR">
        <p>Painel do coletor</p>
      </RequireAuth>,
    );

    await vi.waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/trocar-senha"));
    expect(screen.queryByText("Painel do coletor")).not.toBeInTheDocument();
  });

  it("depois da troca, segue para o painel", async () => {
    const user = userEvent.setup();
    let changed = false;
    mockApi([
      { path: "/auth/me", response: () => success({ user: { ...provisional, trocaSenhaObrigatoria: !changed } }) },
      {
        method: "PATCH",
        path: "/profile/password",
        response: () => {
          changed = true;
          return success(null, "Senha alterada com sucesso.");
        },
      },
    ]);
    renderWithAuth(<ChangePasswordRequired />);

    await user.type(await screen.findByLabelText(/^Senha provisória/), "Provisoria@123");
    await user.type(screen.getByLabelText(/^Nova senha/), "Definitiva@456");
    await user.type(screen.getByLabelText(/^Confirmar nova senha/), "Definitiva@456");
    await user.click(screen.getByRole("button", { name: "Alterar senha" }));

    await vi.waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/coletor"));
  });
});

describe("CollectorCollectionDetail — complementos do coletor (DEC-084)", () => {
  const ecopoint = {
    id: "e1",
    nome: "Ecoponto Central EcoByte",
    descricao: null,
    endereco: {
      logradouro: "Avenida EcoByte",
      numero: "100",
      complemento: null,
      bairro: "Centro",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900000",
    },
    localizacao: null,
    horarios: [],
    status: "ATIVO",
    updatedAt: "2026-10-06T10:00:00.000Z",
  };
  const cliente = { nome: "Mariana Oliveira", telefone: null };

  it("oferece \"Como chegar\" ao endereço da coleta", async () => {
    mockApi([
      { path: "/collections/c1", response: success({ collection: buildCollectorCollection({ status: "ACEITA", cliente }) }) },
    ]);
    renderWithQuery(<CollectorCollectionDetail id="c1" />);

    const section = await screen.findByRole("region", { name: "Endereço da coleta" });
    const link = within(section).getByRole("link", { name: /Como chegar/ });
    expect(link.getAttribute("href")).toContain("https://www.google.com/maps/dir/?api=1&destination=");
    expect(decodeURIComponent(link.getAttribute("href")!)).toContain("Rua das Palmeiras, 120");
    expect(screen.queryByRole("region", { name: "Entrega no ecoponto" })).not.toBeInTheDocument();
  });

  it("coleta RECOLHIDA mostra o ecoponto de entrega", async () => {
    mockApi([
      {
        path: "/collections/c1",
        response: success({ collection: buildCollectorCollection({ status: "RECOLHIDA", cliente }) }),
      },
      { path: "/ecopoint", response: success({ ecopoint }) },
    ]);
    renderWithQuery(<CollectorCollectionDetail id="c1" />);

    const section = await screen.findByRole("region", { name: "Entrega no ecoponto" });
    expect(await within(section).findByText("Ecoponto Central EcoByte")).toBeInTheDocument();
    expect(within(section).getByText("Avenida EcoByte, 100")).toBeInTheDocument();
  });
});
