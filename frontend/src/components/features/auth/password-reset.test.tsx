import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { clienteUser, failure, mockApi, renderWithAuth, success } from "@/test/utils";
import { ForgotPasswordForm } from "./forgot-password-form";
import { LoginForm } from "./login-form";
import { ResetPasswordForm } from "./reset-password-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

const anonymous = { path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") };
const SENT = "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha em instantes.";

describe("Esqueci minha senha (DEC-088)", () => {
  it("o login leva à recuperação de senha", async () => {
    mockApi([anonymous]);
    renderWithAuth(<LoginForm />);

    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute("href", "/esqueci-senha");
  });

  it("envia o e-mail e mostra a confirmação da API", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([
      anonymous,
      { method: "POST", path: "/auth/forgot-password", response: success(null, SENT) },
    ]);
    renderWithAuth(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/^E-mail/), "mariana@ecobyte.local");
    await user.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByRole("status")).toHaveTextContent(SENT);
    expect(calls.find((call) => call.method === "POST")?.body).toEqual({ email: "mariana@ecobyte.local" });
    expect(screen.getByRole("link", { name: "Voltar para o login" })).toHaveAttribute("href", "/entrar");
  });

  it("valida o e-mail antes de enviar", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([anonymous]);
    renderWithAuth(<ForgotPasswordForm />);

    await user.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByText("Informe o e-mail.")).toBeInTheDocument();
    expect(calls.some((call) => call.method === "POST")).toBe(false);
  });

  it("mostra o limite de tentativas", async () => {
    const user = userEvent.setup();
    mockApi([
      anonymous,
      {
        method: "POST",
        path: "/auth/forgot-password",
        response: failure(429, "RATE_LIMIT_EXCEEDED", "Muitas tentativas. Aguarde alguns minutos e tente novamente."),
      },
    ]);
    renderWithAuth(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/^E-mail/), "mariana@ecobyte.local");
    await user.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByText("Muitas tentativas. Aguarde alguns minutos e tente novamente.")).toBeInTheDocument();
  });
});

describe("Redefinir senha (DEC-088)", () => {
  async function fill(user: ReturnType<typeof userEvent.setup>, senha = "NovaSenha@456", confirmacao = senha) {
    await user.type(screen.getByLabelText(/^Nova senha/), senha);
    await user.type(screen.getByLabelText(/^Confirmar nova senha/), confirmacao);
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));
  }

  it("define a nova senha com o token do link e leva ao login", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([
      { path: "/auth/me", response: success({ user: clienteUser }) },
      { method: "POST", path: "/auth/reset-password", response: success(null, "Senha redefinida. Entre com a nova senha.") },
    ]);
    renderWithAuth(<ResetPasswordForm token="abc123" />);

    await fill(user);

    expect(await screen.findByRole("status")).toHaveTextContent("Senha redefinida. Entre com a nova senha.");
    expect(calls.find((call) => call.method === "POST")?.body).toEqual({
      token: "abc123",
      novaSenha: "NovaSenha@456",
      confirmacaoSenha: "NovaSenha@456",
    });
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar");
    // A sessão é recarregada: a API encerrou as sessões da conta.
    expect(calls.filter((call) => call.path === "/api/v1/auth/me").length).toBeGreaterThanOrEqual(2);
  });

  it("aplica a política de senha e a confirmação", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([anonymous]);
    renderWithAuth(<ResetPasswordForm token="abc123" />);

    await fill(user, "NovaSenha@456", "Outra@456");

    expect(await screen.findByText("A confirmação deve ser igual à nova senha.")).toBeInTheDocument();
    expect(calls.some((call) => call.method === "POST")).toBe(false);
  });

  it("link vencido oferece um novo pedido", async () => {
    const user = userEvent.setup();
    mockApi([
      anonymous,
      {
        method: "POST",
        path: "/auth/reset-password",
        response: failure(400, "TOKEN_EXPIRED", "O link de redefinição expirou. Peça um novo link."),
      },
    ]);
    renderWithAuth(<ResetPasswordForm token="abc123" />);

    await fill(user);

    expect(await screen.findByText("O link de redefinição expirou. Peça um novo link.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedir um novo link" })).toHaveAttribute("href", "/esqueci-senha");
  });

  it("sem token, explica e oferece um novo pedido", () => {
    mockApi([anonymous]);
    renderWithAuth(<ResetPasswordForm token={null} />);

    expect(screen.getByText("Link de redefinição inválido.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Redefinir senha" })).not.toBeInTheDocument();
  });
});
