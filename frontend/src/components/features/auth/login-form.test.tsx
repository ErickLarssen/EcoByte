import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { clienteUser, failure, mockApi, renderWithAuth, success } from "@/test/utils";
import { useAuth } from "./auth-provider";
import { LoginForm } from "./login-form";

function AuthStatus() {
  const { status, user } = useAuth();
  return <p data-testid="auth-status">{status === "authenticated" ? `logado:${user.email}` : status}</p>;
}

function renderLogin() {
  return renderWithAuth(
    <>
      <LoginForm />
      <AuthStatus />
    </>,
  );
}

const anonymous = { path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") };

describe("LoginForm (11 §71, 17_TESTING §76)", () => {
  it("possui campos rotulados, obrigatórios e com autocomplete adequado (12 §47, §87)", () => {
    mockApi([anonymous]);
    renderLogin();

    const email = screen.getByLabelText(/E-mail/);
    const senha = screen.getByLabelText(/^Senha/);
    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(email).toHaveAttribute("aria-required", "true");
    expect(senha).toHaveAttribute("autocomplete", "current-password");
  });

  it("valida no navegador sem chamar a API e associa o erro ao campo", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([anonymous]);
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    const email = screen.getByLabelText(/E-mail/);
    expect(await screen.findByText("Informe o e-mail.")).toBeInTheDocument();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-describedby", "email-erro");
    expect(calls.filter((call) => call.path === "/api/v1/auth/login")).toHaveLength(0);
  });

  it("autentica e atualiza o estado da sessão", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([
      anonymous,
      { method: "POST", path: "/auth/login", response: success({ user: clienteUser }, "Login realizado com sucesso.") },
    ]);
    renderLogin();

    await user.type(screen.getByLabelText(/E-mail/), "mariana@ecobyte.local");
    await user.type(screen.getByLabelText(/^Senha/), "ClientePF123!");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(screen.getByTestId("auth-status")).toHaveTextContent("logado:mariana@ecobyte.local"));
    expect(calls.find((call) => call.path === "/api/v1/auth/login")?.body).toEqual({
      email: "mariana@ecobyte.local",
      senha: "ClientePF123!",
    });
  });

  it.each([
    ["INVALID_CREDENTIALS", 401, "E-mail ou senha incorretos."],
    ["USER_INACTIVE", 403, "Sua conta está inativa. Entre em contato com a EcoByte."],
    ["RATE_LIMIT_EXCEEDED", 429, "Muitas tentativas. Aguarde alguns minutos e tente novamente."],
  ])("exibe mensagem clara para %s", async (code, status, message) => {
    const user = userEvent.setup();
    mockApi([
      anonymous,
      {
        method: "POST",
        path: "/auth/login",
        response: failure(status, code, "Muitas tentativas. Aguarde alguns minutos e tente novamente."),
      },
    ]);
    renderLogin();

    await user.type(screen.getByLabelText(/E-mail/), "mariana@ecobyte.local");
    await user.type(screen.getByLabelText(/^Senha/), "Qualquer@1");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByText(message);
    expect(alert.closest("[role=alert]")).not.toBeNull();
    expect(screen.getByTestId("auth-status")).toHaveTextContent("unauthenticated");
  });
});
