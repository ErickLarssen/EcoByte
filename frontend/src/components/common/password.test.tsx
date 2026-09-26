import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "./password-input";
import { PasswordRequirements } from "./password-requirements";

describe("PasswordRequirements (11 §14)", () => {
  it("marca cada requisito atendido com ícone e texto, não só cor", () => {
    render(<PasswordRequirements value="senha1" />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(screen.getByText("Uma letra minúscula").closest("li")).toHaveAttribute("data-met", "true");
    expect(screen.getByText("Um número").closest("li")).toHaveAttribute("data-met", "true");
    expect(screen.getByText("Pelo menos 8 caracteres").closest("li")).toHaveAttribute("data-met", "false");
    expect(screen.getAllByText("(pendente)", { exact: false })).toHaveLength(3);
  });

  it("atende todos com uma senha válida", () => {
    render(<PasswordRequirements value="Senha@123" />);

    expect(screen.getAllByText("(atendido)", { exact: false })).toHaveLength(5);
  });
});

describe("PasswordInput (11 §13)", () => {
  it("começa oculto e alterna para visível com botão acessível", async () => {
    const user = userEvent.setup();
    render(
      <>
        <label htmlFor="senha">Senha</label>
        <PasswordInput id="senha" defaultValue="Segredo@1" />
      </>,
    );

    const input = screen.getByLabelText("Senha");
    const toggle = screen.getByRole("button", { name: "Mostrar senha" });
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute("aria-pressed", "true");
  });

  it("o botão de alternar não envia o formulário", async () => {
    const user = userEvent.setup();
    let submitted = false;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = true;
        }}
      >
        <PasswordInput id="senha" aria-label="Senha" />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(submitted).toBe(false);
  });
});
