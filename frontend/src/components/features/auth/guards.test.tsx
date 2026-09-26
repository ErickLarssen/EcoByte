import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clienteUser, failure, mockApi, renderWithAuth, success } from "@/test/utils";
import { GuestOnly } from "./guest-only";
import { RequireAuth } from "./require-auth";

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  pathname: "/cliente/coletas",
  search: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

beforeEach(() => {
  navigation.replace.mockReset();
  navigation.pathname = "/cliente/coletas";
  navigation.search = "";
});

describe("RequireAuth (11 §129, DEC-072)", () => {
  it("mostra carregamento enquanto verifica a sessão", () => {
    mockApi([{ path: "/auth/me", response: success({ user: clienteUser }) }]);
    renderWithAuth(<RequireAuth role="CLIENTE">conteúdo protegido</RequireAuth>);

    expect(screen.getByRole("status")).toHaveTextContent("Verificando sua sessão...");
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("exibe o conteúdo para o perfil correto", async () => {
    mockApi([{ path: "/auth/me", response: success({ user: clienteUser }) }]);
    renderWithAuth(<RequireAuth role="CLIENTE">conteúdo protegido</RequireAuth>);

    expect(await screen.findByText("conteúdo protegido")).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("envia visitante ao login preservando a página", async () => {
    mockApi([{ path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") }]);
    renderWithAuth(<RequireAuth role="CLIENTE">conteúdo protegido</RequireAuth>);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/entrar?proximo=%2Fcliente%2Fcoletas"));
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("envia usuário de outro perfil à própria área, sem mostrar o conteúdo", async () => {
    mockApi([{ path: "/auth/me", response: success({ user: { ...clienteUser, role: "COLETOR" } }) }]);
    renderWithAuth(<RequireAuth role="ADMIN">painel admin</RequireAuth>);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/coletor"));
    expect(screen.queryByText("painel admin")).not.toBeInTheDocument();
  });
});

describe("GuestOnly (DEC-072)", () => {
  it("exibe login para visitante", async () => {
    mockApi([{ path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") }]);
    renderWithAuth(<GuestOnly>formulário de login</GuestOnly>);

    expect(await screen.findByText("formulário de login")).toBeInTheDocument();
  });

  it("envia usuário autenticado à página solicitada da sua área", async () => {
    navigation.search = "proximo=%2Fcliente%2Fcoletas%2Fnova";
    mockApi([{ path: "/auth/me", response: success({ user: clienteUser }) }]);
    renderWithAuth(<GuestOnly>formulário de login</GuestOnly>);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/cliente/coletas/nova"));
  });

  it("ignora retorno para domínio externo", async () => {
    navigation.search = "proximo=https%3A%2F%2Fmalicioso.exemplo";
    mockApi([{ path: "/auth/me", response: success({ user: clienteUser }) }]);
    renderWithAuth(<GuestOnly>formulário de login</GuestOnly>);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/cliente"));
  });
});
