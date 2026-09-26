import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { clienteUser, failure, mockApi, renderWithAuth, success } from "@/test/utils";
import { RegistrationForm } from "./registration-form";

const anonymous = { path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") };

async function fillPF(user: UserEvent, overrides: { confirmacao?: string } = {}) {
  await user.type(screen.getByLabelText(/Nome completo/), "Mariana Oliveira");
  await user.type(screen.getByLabelText(/E-mail/), "mariana@teste.local");
  await user.type(screen.getByLabelText(/^Senha/), "Senha@123");
  await user.type(screen.getByLabelText(/Confirme a senha/), overrides.confirmacao ?? "Senha@123");
}

describe("RegistrationForm (11 §70, 17_TESTING §77)", () => {
  it("começa como PF, sem campos de empresa", () => {
    mockApi([anonymous]);
    renderWithAuth(<RegistrationForm />);

    expect(screen.getByRole("radio", { name: /Pessoa física/ })).toBeChecked();
    expect(screen.queryByLabelText(/Razão social/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Nome completo/)).toBeInTheDocument();
  });

  it("mostra razão social e nome fantasia ao escolher PJ (10 §40)", async () => {
    const user = userEvent.setup();
    mockApi([anonymous]);
    renderWithAuth(<RegistrationForm />);

    await user.click(screen.getByRole("radio", { name: /Pessoa jurídica/ }));

    expect(screen.getByLabelText(/Razão social/)).toHaveAttribute("aria-required", "true");
    expect(screen.getByLabelText(/Nome fantasia/)).not.toHaveAttribute("aria-required");
    expect(screen.getByLabelText(/Nome do responsável/)).toBeInTheDocument();
  });

  it("mostra os requisitos da senha conforme a digitação", async () => {
    const user = userEvent.setup();
    mockApi([anonymous]);
    renderWithAuth(<RegistrationForm />);

    await user.type(screen.getByLabelText(/^Senha/), "abc");

    expect(screen.getByText("Uma letra minúscula").closest("li")).toHaveAttribute("data-met", "true");
    expect(screen.getByText("Uma letra maiúscula").closest("li")).toHaveAttribute("data-met", "false");
  });

  it("impede envio com confirmação diferente", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([anonymous]);
    renderWithAuth(<RegistrationForm />);

    await fillPF(user, { confirmacao: "Outra@123" });
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("A confirmação deve ser igual à senha.")).toBeInTheDocument();
    expect(calls.some((call) => call.path === "/api/v1/auth/register")).toBe(false);
  });

  it("envia cadastro PF sem dados empresariais nem telefone vazio", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([
      anonymous,
      { method: "POST", path: "/auth/register", response: success({ user: clienteUser }, "Cadastro realizado.", 201) },
    ]);
    renderWithAuth(<RegistrationForm />);

    await fillPF(user);
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(calls.some((call) => call.path === "/api/v1/auth/register")).toBe(true));
    expect(calls.find((call) => call.path === "/api/v1/auth/register")?.body).toEqual({
      nome: "Mariana Oliveira",
      email: "mariana@teste.local",
      senha: "Senha@123",
      confirmacaoSenha: "Senha@123",
      tipoCadastro: "PF",
    });
  });

  it("envia cadastro PJ com dadosEmpresa (DEC-066)", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([
      anonymous,
      { method: "POST", path: "/auth/register", response: success({ user: clienteUser }, "Cadastro realizado.", 201) },
    ]);
    renderWithAuth(<RegistrationForm />);

    await user.click(screen.getByRole("radio", { name: /Pessoa jurídica/ }));
    await user.type(screen.getByLabelText(/Nome do responsável/), "Carlos Responsável");
    await user.type(screen.getByLabelText(/Razão social/), "Tech Verde Ltda.");
    await user.type(screen.getByLabelText(/E-mail/), "empresa@teste.local");
    await user.type(screen.getByLabelText(/Telefone/), "11999990000");
    await user.type(screen.getByLabelText(/^Senha/), "Senha@123");
    await user.type(screen.getByLabelText(/Confirme a senha/), "Senha@123");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(calls.some((call) => call.path === "/api/v1/auth/register")).toBe(true));
    expect(calls.find((call) => call.path === "/api/v1/auth/register")?.body).toMatchObject({
      tipoCadastro: "PJ",
      telefone: "11999990000",
      dadosEmpresa: { razaoSocial: "Tech Verde Ltda." },
    });
  });

  it("leva os erros de campo da API para o campo correspondente", async () => {
    const user = userEvent.setup();
    mockApi([
      anonymous,
      {
        method: "POST",
        path: "/auth/register",
        response: failure(400, "VALIDATION_ERROR", "Existem campos inválidos.", {
          email: "Informe um e-mail válido.",
        }),
      },
    ]);
    renderWithAuth(<RegistrationForm />);

    await fillPF(user);
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/)).toHaveAttribute("aria-invalid", "true");
  });

  it("exibe alerta para e-mail já cadastrado (409)", async () => {
    const user = userEvent.setup();
    mockApi([
      anonymous,
      {
        method: "POST",
        path: "/auth/register",
        response: failure(409, "EMAIL_ALREADY_EXISTS", "Este e-mail já está cadastrado."),
      },
    ]);
    renderWithAuth(<RegistrationForm />);

    await fillPF(user);
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    const message = await screen.findByText("Este e-mail já está cadastrado.");
    expect(message.closest("[role=alert]")).not.toBeNull();
  });
});
