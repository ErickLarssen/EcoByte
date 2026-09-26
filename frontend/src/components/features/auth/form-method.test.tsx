import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { failure, mockApi, renderWithAuth } from "@/test/utils";
import { LoginForm } from "./login-form";
import { RegistrationForm } from "./registration-form";

// Se o formulário for enviado antes de o JavaScript carregar, o navegador usa o
// método declarado. Com o padrão (GET), e-mail e senha iriam para a URL,
// ficando no histórico e em logs. POST mantém os dados fora da URL.
describe("formulários de autenticação: envio nativo seguro", () => {
  it.each([
    ["Entrar", <LoginForm key="login" />],
    ["Criar conta", <RegistrationForm key="cadastro" />],
  ])("%s declara method=post", (name, form) => {
    mockApi([{ path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") }]);
    renderWithAuth(form);

    expect(screen.getByRole("form", { name })).toHaveAttribute("method", "post");
  });
});
