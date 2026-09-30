import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdminEcopoint } from "@/components/features/admin/admin-ecopoint";
import type { Ecopoint } from "@/lib/api/ecopoint";
import { failure, mockApi, renderWithQuery, success } from "@/test/utils";
import { EcopointInfo } from "./ecopoint-info";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function buildEcopoint(overrides: Partial<Ecopoint> = {}): Ecopoint {
  return {
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
    localizacao: { type: "Point", coordinates: [-46.6228, -23.6812] },
    horarios: [],
    status: "ATIVO",
    updatedAt: "2026-09-29T13:00:00.000Z",
    ...overrides,
  };
}

// API simulada com estado: o PATCH aplica os campos enviados.
function mockEcopointApi(initial = buildEcopoint(), patch?: () => ReturnType<typeof failure>) {
  let current = initial;
  return mockApi([
    { path: "/ecopoint", response: () => success({ ecopoint: current }) },
    {
      method: "PATCH",
      path: "/ecopoint",
      response: (body) => {
        if (patch) return patch();
        current = { ...current, ...(body as Partial<Ecopoint>) };
        return success({ ecopoint: current }, "Ecoponto atualizado.");
      },
    },
  ]);
}

describe("EcopointInfo (RF-036, 11 §61)", () => {
  it("mostra nome, endereço e horários ainda não definidos", async () => {
    mockEcopointApi(buildEcopoint({ descricao: "Recebe eletrônicos." }));
    renderWithQuery(<EcopointInfo />);

    expect(await screen.findByRole("heading", { name: "Ecoponto Central EcoByte" })).toBeInTheDocument();
    expect(screen.getByText("Recebe eletrônicos.")).toBeInTheDocument();
    expect(screen.getByText("Avenida EcoByte, 100")).toBeInTheDocument();
    expect(screen.getByText("Centro, Diadema/SP · CEP 09900-000")).toBeInTheDocument();
    expect(screen.getByText("Horários de funcionamento a definir.")).toBeInTheDocument();
    expect(screen.queryByText("Temporariamente sem receber materiais.")).not.toBeInTheDocument();
  });

  it("ecoponto inativo não aparece como disponível (BR-038)", async () => {
    mockEcopointApi(buildEcopoint({ status: "INATIVO" }));
    renderWithQuery(<EcopointInfo />);

    expect(await screen.findByText("Temporariamente sem receber materiais.")).toBeInTheDocument();
  });

  it("sem ecoponto cadastrado (404), informa sem sugerir erro", async () => {
    mockApi([{ path: "/ecopoint", response: failure(404, "RESOURCE_NOT_FOUND", "Ecoponto não encontrado.") }]);
    renderWithQuery(<EcopointInfo />);

    expect(await screen.findByText("As informações do ecoponto ainda não foram cadastradas.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("AdminEcopoint (RF-039, DEC-065, DEC-076)", () => {
  it("preenche o formulário e só permite salvar depois de uma alteração", async () => {
    mockEcopointApi();
    renderWithQuery(<AdminEcopoint />);

    expect(await screen.findByLabelText(/^Nome/)).toHaveValue("Ecoponto Central EcoByte");
    expect(screen.getByLabelText(/^Latitude/)).toHaveValue("-23.6812");
    expect(screen.getByLabelText(/^Longitude/)).toHaveValue("-46.6228");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
  });

  it("envia os dados, com a localização em GeoJSON [longitude, latitude]", async () => {
    const user = userEvent.setup();
    const { calls } = mockEcopointApi();
    renderWithQuery(<AdminEcopoint />);

    const nome = await screen.findByLabelText(/^Nome/);
    await user.clear(nome);
    await user.type(nome, "EcoByte Diadema");
    await user.clear(screen.getByLabelText(/^Latitude/));
    await user.type(screen.getByLabelText(/^Latitude/), "-23,7");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Ecoponto atualizado.");
    const body = calls.find((call) => call.method === "PATCH")?.body;
    expect(body).toEqual({
      nome: "EcoByte Diadema",
      descricao: null,
      endereco: {
        logradouro: "Avenida EcoByte",
        numero: "100",
        bairro: "Centro",
        cidade: "Diadema",
        estado: "SP",
        cep: "09900000",
      },
      localizacao: { type: "Point", coordinates: [-46.6228, -23.7] },
    });
    expect(body).not.toHaveProperty("horarios");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
  });

  it("apagar as duas coordenadas remove a localização; só uma é erro", async () => {
    const user = userEvent.setup();
    const { calls } = mockEcopointApi();
    renderWithQuery(<AdminEcopoint />);

    await user.clear(await screen.findByLabelText(/^Latitude/));
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(await screen.findByText("Informe latitude e longitude, ou deixe as duas em branco.")).toBeInTheDocument();
    expect(calls.some((call) => call.method === "PATCH")).toBe(false);

    await user.clear(screen.getByLabelText(/^Longitude/));
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await screen.findByRole("status");
    expect(calls.find((call) => call.method === "PATCH")?.body).toMatchObject({ localizacao: null });
  });

  it("leva os erros de campo da API para o formulário", async () => {
    const user = userEvent.setup();
    mockEcopointApi(buildEcopoint(), () =>
      failure(400, "VALIDATION_ERROR", "Existem campos inválidos.", { "localizacao.coordinates.1": "Latitude inválida." }),
    );
    renderWithQuery(<AdminEcopoint />);

    const nome = await screen.findByLabelText(/^Nome/);
    await user.type(nome, " 2");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByText("Latitude inválida.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Latitude/)).toHaveAttribute("aria-invalid", "true");
  });

  it("desativa somente após confirmar e informa a consequência", async () => {
    const user = userEvent.setup();
    const { calls } = mockEcopointApi();
    renderWithQuery(<AdminEcopoint />);

    await user.click(await screen.findByRole("button", { name: "Desativar ecoponto" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Desativar ecoponto?" });
    expect(dialog).toHaveTextContent("os coletores não conseguirão registrar entregas");
    await user.click(within(dialog).getByRole("button", { name: "Desativar" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Ecoponto desativado.");
    expect(calls.filter((call) => call.method === "PATCH").map((call) => call.body)).toEqual([{ status: "INATIVO" }]);
    expect(screen.getByRole("button", { name: "Reativar ecoponto" })).toBeInTheDocument();
  });
});
