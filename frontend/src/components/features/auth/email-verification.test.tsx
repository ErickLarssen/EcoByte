import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { clienteUser, failure, mockApi, renderWithAuth, success } from "@/test/utils";
import { EmailVerification } from "./email-verification";
import { EmailVerificationNotice, RequireVerifiedEmail } from "./email-verification-notice";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

const unverified = { ...clienteUser, emailVerificado: false };

describe("EmailVerificationNotice (DEC-082)", () => {
  it("avisa o cliente não verificado e reenvia o link", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([
      { path: "/auth/me", response: success({ user: unverified }) },
      {
        method: "POST",
        path: "/auth/verify-email/resend",
        response: success(null, "Enviamos um novo link para o seu e-mail."),
      },
    ]);
    renderWithAuth(<EmailVerificationNotice />);

    expect(await screen.findByText("Confirme seu e-mail")).toBeInTheDocument();
    expect(screen.getByText(clienteUser.email)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reenviar e-mail" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Enviamos um novo link para o seu e-mail.");
    expect(calls.some((call) => call.path === "/api/v1/auth/verify-email/resend")).toBe(true);
  });

  it("não aparece para quem já confirmou", async () => {
    const { calls } = mockApi([{ path: "/auth/me", response: success({ user: clienteUser }) }]);
    renderWithAuth(<EmailVerificationNotice />);

    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(screen.queryByText("Confirme seu e-mail")).not.toBeInTheDocument();
  });

  it("RequireVerifiedEmail esconde o formulário até a confirmação", async () => {
    mockApi([{ path: "/auth/me", response: success({ user: unverified }) }]);
    renderWithAuth(
      <RequireVerifiedEmail>
        <p>Formulário de solicitação</p>
      </RequireVerifiedEmail>,
    );

    expect(await screen.findByText(/fica disponível depois que você confirmar/)).toBeInTheDocument();
    expect(screen.queryByText("Formulário de solicitação")).not.toBeInTheDocument();
  });
});

describe("EmailVerification — página do link (DEC-082)", () => {
  it("confirma o token e atualiza o usuário logado", async () => {
    let verified = false;
    const { calls } = mockApi([
      { path: "/auth/me", response: () => success({ user: { ...clienteUser, emailVerificado: verified } }) },
      {
        method: "POST",
        path: "/auth/verify-email",
        response: () => {
          verified = true;
          return success(null, "E-mail confirmado com sucesso.");
        },
      },
    ]);
    renderWithAuth(<EmailVerification token="token-valido" />);

    expect(await screen.findByText("E-mail confirmado!")).toBeInTheDocument();
    expect(calls.find((call) => call.path === "/api/v1/auth/verify-email")?.body).toEqual({ token: "token-valido" });
    expect(await screen.findByRole("link", { name: "Ir para o meu painel" })).toHaveAttribute("href", "/cliente");
    expect(calls.filter((call) => call.path === "/api/v1/auth/me").length).toBeGreaterThanOrEqual(2);
  });

  it("link expirado: explica e orienta a pedir um novo", async () => {
    mockApi([
      { path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") },
      {
        method: "POST",
        path: "/auth/verify-email",
        response: failure(400, "TOKEN_EXPIRED", "O link de confirmação expirou. Peça um novo link."),
      },
    ]);
    renderWithAuth(<EmailVerification token="token-velho" />);

    expect(await screen.findByText("Não foi possível confirmar o e-mail")).toBeInTheDocument();
    expect(screen.getByText("O link de confirmação expirou. Peça um novo link.")).toBeInTheDocument();
    expect(await screen.findByText("Entre na sua conta para pedir um novo link.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar");
  });

  it("sem token, informa link inválido sem chamar a API", async () => {
    const { calls } = mockApi([{ path: "/auth/me", response: failure(401, "UNAUTHORIZED", "x") }]);
    renderWithAuth(<EmailVerification token={null} />);

    expect(await screen.findByText("Link de confirmação inválido.")).toBeInTheDocument();
    expect(calls.some((call) => call.path === "/api/v1/auth/verify-email")).toBe(false);
  });
});
