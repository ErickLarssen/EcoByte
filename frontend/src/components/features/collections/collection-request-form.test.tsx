import { screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clientCollectionKeys } from "@/hooks/use-client-collections";
import { buildCollection, failure, mockApi, paginated, renderWithQuery, success } from "@/test/utils";
import { CollectionRequestForm } from "./collection-request-form";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

beforeEach(() => router.push.mockReset());

async function fillAddress(user: UserEvent) {
  await user.type(screen.getByLabelText(/^CEP/), "09900-001");
  await user.type(screen.getByLabelText(/^Número/), "120");
  await user.type(screen.getByLabelText(/^Logradouro/), "Rua das Palmeiras");
  await user.type(screen.getByLabelText(/^Complemento/), "Casa 2");
  await user.type(screen.getByLabelText(/^Bairro/), "Centro");
  await user.type(screen.getByLabelText(/^Cidade/), "Diadema");
  await user.type(screen.getByLabelText(/^Estado/), "sp");
}

async function fillFirstItem(user: UserEvent) {
  await user.type(screen.getByLabelText(/^Categoria/), "INFORMATICA");
  await user.type(screen.getByLabelText(/^Condição/), "USADO");
  const quantidade = screen.getByLabelText(/^Quantidade/);
  await user.clear(quantidade);
  await user.type(quantidade, "2");
}

async function goToReview(user: UserEvent) {
  await fillAddress(user);
  await user.click(screen.getByRole("button", { name: /Continuar/ }));
  await fillFirstItem(user);
  await user.click(screen.getByRole("button", { name: /Continuar/ }));
  await screen.findByRole("heading", { name: "Revise e confirme" });
}

describe("CollectionRequestForm (11 §64, 17_TESTING §78, DEC-073)", () => {
  it("começa no endereço e indica a etapa também em texto (12 §55)", () => {
    mockApi([]);
    renderWithQuery(<CollectionRequestForm />);

    expect(screen.getByText("Etapa 1 de 3: Endereço")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Onde retirar o material?" })).toBeInTheDocument();
    expect(screen.queryByText(/Agendamento/)).not.toBeInTheDocument();
  });

  it("não avança com endereço incompleto e indica os campos", async () => {
    const user = userEvent.setup();
    mockApi([]);
    renderWithQuery(<CollectionRequestForm />);

    await user.click(screen.getByRole("button", { name: /Continuar/ }));

    expect(await screen.findByText("O CEP deve ter 8 dígitos.")).toBeInTheDocument();
    expect(screen.getByText("Informe o logradouro.")).toBeInTheDocument();
    expect(screen.getByText("Etapa 1 de 3: Endereço")).toBeInTheDocument();
    expect(screen.getByLabelText(/^CEP/)).toHaveAttribute("aria-invalid", "true");
  });

  it("avança para os itens e move o foco para o título da etapa", async () => {
    const user = userEvent.setup();
    mockApi([]);
    renderWithQuery(<CollectionRequestForm />);

    await fillAddress(user);
    await user.click(screen.getByRole("button", { name: /Continuar/ }));

    const heading = await screen.findByRole("heading", { name: "O que será descartado?" });
    expect(heading).toHaveFocus();
    expect(screen.getByText("Etapa 2 de 3: Itens")).toBeInTheDocument();
  });

  it("adiciona e remove itens e valida a quantidade", async () => {
    const user = userEvent.setup();
    mockApi([]);
    renderWithQuery(<CollectionRequestForm />);
    await fillAddress(user);
    await user.click(screen.getByRole("button", { name: /Continuar/ }));

    expect(screen.queryByRole("button", { name: "Remover item 1" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Adicionar outro item/ }));
    const items = within(screen.getByRole("list", { name: "Itens da coleta" })).getAllByRole("listitem");
    expect(items).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Remover item 2" }));
    expect(within(screen.getByRole("list", { name: "Itens da coleta" })).getAllByRole("listitem")).toHaveLength(1);

    await user.type(screen.getByLabelText(/^Categoria/), "CABOS");
    await user.type(screen.getByLabelText(/^Condição/), "USADO");
    await user.clear(screen.getByLabelText(/^Quantidade/));
    await user.type(screen.getByLabelText(/^Quantidade/), "0");
    await user.click(screen.getByRole("button", { name: /Continuar/ }));

    expect(await screen.findByText("A quantidade mínima é 1.")).toBeInTheDocument();
    expect(screen.getByText("Etapa 2 de 3: Itens")).toBeInTheDocument();
  });

  it("oferece sugestões provisórias de categoria e condição", async () => {
    const user = userEvent.setup();
    mockApi([]);
    renderWithQuery(<CollectionRequestForm />);
    await fillAddress(user);
    await user.click(screen.getByRole("button", { name: /Continuar/ }));

    const categoria = screen.getByLabelText(/^Categoria/);
    const datalist = document.getElementById(categoria.getAttribute("list")!);
    expect(datalist?.querySelectorAll("option").length).toBeGreaterThan(0);
    expect(datalist?.querySelector('option[value="INFORMATICA"]')).not.toBeNull();
  });

  it("revisa os dados normalizados e permite editar uma etapa", async () => {
    const user = userEvent.setup();
    mockApi([]);
    renderWithQuery(<CollectionRequestForm />);

    await goToReview(user);

    expect(screen.getByText("Rua das Palmeiras, 120 — Casa 2")).toBeInTheDocument();
    expect(screen.getByText("Centro, Diadema/SP · CEP 09900-001")).toBeInTheDocument();
    expect(screen.getByText("Informatica")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Editar endereço" }));
    expect(await screen.findByRole("heading", { name: "Onde retirar o material?" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Logradouro/)).toHaveValue("Rua das Palmeiras");
  });

  it("Enter numa etapa intermediária avança em vez de enviar", async () => {
    const user = userEvent.setup();
    const { calls } = mockApi([]);
    renderWithQuery(<CollectionRequestForm />);

    await fillAddress(user);
    await user.type(screen.getByLabelText(/^Estado/), "{Enter}");

    expect(await screen.findByText("Etapa 2 de 3: Itens")).toBeInTheDocument();
    expect(calls.filter((call) => call.method === "POST")).toHaveLength(0);
  });

  it("envia o payload do contrato, sem dataAgendada, e abre o detalhe da nova coleta", async () => {
    const user = userEvent.setup();
    const created = buildCollection({ id: "nova-123" });
    const { calls } = mockApi([
      { method: "POST", path: "/collections", response: success({ collection: created }, "Coleta solicitada.", 201) },
      { path: "/collections?page=1&limit=10", response: success(paginated([created])) },
    ]);
    const { queryClient } = renderWithQuery(<CollectionRequestForm />);
    queryClient.setQueryData(clientCollectionKeys.list(1, 10), paginated([]));

    await goToReview(user);
    await user.type(screen.getByLabelText(/^Observações/), "Portão azul.");
    await user.click(screen.getByRole("button", { name: "Confirmar solicitação" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/cliente/coletas/nova-123?nova=1"));
    expect(calls.find((call) => call.method === "POST")?.body).toEqual({
      enderecoColeta: {
        cep: "09900001",
        logradouro: "Rua das Palmeiras",
        numero: "120",
        complemento: "Casa 2",
        bairro: "Centro",
        cidade: "Diadema",
        estado: "SP",
      },
      itensDescarte: [{ categoria: "INFORMATICA", quantidade: 2, condicao: "USADO" }],
      observacoes: "Portão azul.",
    });
    // A lista do cliente foi invalidada e o detalhe já está em cache (11 §96).
    expect(queryClient.getQueryState(clientCollectionKeys.list(1, 10))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryData(clientCollectionKeys.detail("nova-123"))).toEqual(created);
  });

  it("volta à etapa do campo recusado pela API e mostra a mensagem junto a ele", async () => {
    const user = userEvent.setup();
    mockApi([
      {
        method: "POST",
        path: "/collections",
        response: failure(400, "VALIDATION_ERROR", "Existem campos inválidos.", {
          "enderecoColeta.bairro": "Máximo de 120 caracteres.",
        }),
      },
    ]);
    renderWithQuery(<CollectionRequestForm />);

    await goToReview(user);
    await user.click(screen.getByRole("button", { name: "Confirmar solicitação" }));

    expect(await screen.findByText("Etapa 1 de 3: Endereço")).toBeInTheDocument();
    expect(screen.getByText("Máximo de 120 caracteres.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Bairro/)).toHaveAttribute("aria-invalid", "true");
    expect(router.push).not.toHaveBeenCalled();
  });

  it("mostra alerta para erros sem campo (ex.: falha de rede) e permanece na revisão", async () => {
    const user = userEvent.setup();
    mockApi([]);
    renderWithQuery(<CollectionRequestForm />);

    await goToReview(user);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await user.click(screen.getByRole("button", { name: "Confirmar solicitação" }));

    const alert = await screen.findByText("Não foi possível conectar ao servidor. Verifique sua conexão.");
    expect(alert.closest("[role=alert]")).not.toBeNull();
    expect(screen.getByText("Etapa 3 de 3: Revisão")).toBeInTheDocument();
  });
});
