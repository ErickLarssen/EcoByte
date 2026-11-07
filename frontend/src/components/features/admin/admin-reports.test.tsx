import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminReports as Reports } from "@/lib/api/admin";
import { failure, mockApi, renderWithQuery, success } from "@/test/utils";
import { AdminReports } from "./admin-reports";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/relatorios",
  useSearchParams: () => navigation.params,
  useRouter: () => ({ push: vi.fn(), replace: navigation.replace }),
}));

beforeEach(() => {
  navigation.replace.mockReset();
  navigation.params = new URLSearchParams();
});

function buildReports(overrides: Partial<Reports> = {}): Reports {
  return {
    periodo: { inicio: null, fim: null },
    resumo: {
      totalColetas: 4,
      concluidas: 2,
      emAndamento: 1,
      pendentes: 1,
      itensSolicitados: 11,
      itensRecolhidos: 6,
      clientesAtendidos: 2,
    },
    porStatus: [
      { status: "PENDENTE", total: 1 },
      { status: "ACEITA", total: 0 },
      { status: "A_CAMINHO", total: 1 },
      { status: "RECOLHIDA", total: 0 },
      { status: "ENTREGUE_ECOPONTO", total: 0 },
      { status: "CONCLUIDA", total: 2 },
    ],
    porMes: [
      { ano: 2026, mes: 10, solicitadas: 2, concluidas: 1 },
      { ano: 2026, mes: 11, solicitadas: 2, concluidas: 1 },
    ],
    porCategoria: [
      { categoria: "INFORMATICA", quantidade: 7, coletas: 2 },
      { categoria: "CELULARES", quantidade: 1, coletas: 1 },
    ],
    porCondicao: [{ condicao: "USADO", quantidade: 4 }],
    porBairro: [{ bairro: "Centro", total: 2 }],
    porColetor: [{ coletor: { id: "c1", nome: "Carlos Coletor" }, atendidas: 2, concluidas: 2 }],
    temposMedios: {
      ateAceite: { horas: 2.3, coletas: 3 },
      ateRecolhimento: { horas: 4, coletas: 2 },
      ateEntrega: { horas: null, coletas: 0 },
      total: { horas: 72, coletas: 2 },
    },
    ...overrides,
  };
}

describe("AdminReports (RF-046, DEC-098)", () => {
  it("apresenta o resumo, os gráficos com valores em texto e os tempos médios", async () => {
    mockApi([{ path: "/admin/reports", response: success(buildReports()) }]);
    renderWithQuery(<AdminReports />);

    const summary = await screen.findByRole("region", { name: "Resumo" });
    expect(within(summary).getByText("Coletas solicitadas").nextSibling).toHaveTextContent("4");
    expect(within(summary).getByText("de 11 solicitados")).toBeInTheDocument();

    // Cada barra traz o rótulo e o valor em texto: a lista é a tabela acessível.
    const categories = screen.getByRole("list", { name: "Itens por categoria" });
    const rows = within(categories).getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Informatica");
    expect(rows[0]).toHaveTextContent("7 itens · 2 coletas");
    expect(rows[1]).toHaveTextContent("1 item · 1 coleta");

    const status = within(screen.getByRole("list", { name: "Coletas por status" })).getAllByRole("listitem");
    expect(status.map((row) => row.textContent)).toContain("Concluída2");

    // Duas séries por mês, com legenda.
    expect(within(screen.getByRole("list", { name: "Legenda" })).getAllByRole("listitem")).toHaveLength(2);
    const months = within(screen.getByRole("list", { name: "Coletas por mês" })).getAllByRole("listitem");
    expect(months[0]).toHaveTextContent("out/2026");
    expect(months[0]).toHaveTextContent("2 solicitadas");
    expect(months[0]).toHaveTextContent("1 concluídas");

    expect(screen.getByRole("table", { name: "Coletas por coletor" })).toHaveTextContent("Carlos Coletor");

    // Horas até 48h; acima, dias. Etapa sem dados é dita, não mostrada como zero.
    expect(screen.getByText("2,3 h")).toBeInTheDocument();
    expect(screen.getByText("3 dias")).toBeInTheDocument();
    expect(screen.getByText("Sem dados")).toBeInTheDocument();
  });

  it("aplica o período pela URL", async () => {
    const user = userEvent.setup();
    mockApi([{ path: "/admin/reports", response: success(buildReports()) }]);
    renderWithQuery(<AdminReports />);

    await user.type(await screen.findByLabelText("De"), "2026-10-01");
    await user.type(screen.getByLabelText("Até"), "2026-10-31");
    await user.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(navigation.replace).toHaveBeenCalledWith("/admin/relatorios?inicio=2026-10-01&fim=2026-10-31");
  });

  it("recusa período invertido antes de consultar", async () => {
    const user = userEvent.setup();
    mockApi([{ path: "/admin/reports", response: success(buildReports()) }]);
    renderWithQuery(<AdminReports />);

    await user.type(await screen.findByLabelText("De"), "2026-11-10");
    await user.type(screen.getByLabelText("Até"), "2026-11-01");
    await user.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(screen.getByText("A data final deve ser igual ou posterior à inicial.")).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("consulta a API com o período da URL e mostra a recusa dela", async () => {
    navigation.params = new URLSearchParams("inicio=2026-02-30");
    const { calls } = mockApi([
      {
        path: "/admin/reports?inicio=2026-02-30",
        response: failure(400, "VALIDATION_ERROR", "Existem campos inválidos.", { inicio: "inicio não é uma data válida." }),
      },
    ]);
    renderWithQuery(<AdminReports />);

    expect(await screen.findByText("inicio não é uma data válida.")).toBeInTheDocument();
    expect(calls[0]?.path).toBe("/api/v1/admin/reports?inicio=2026-02-30");
  });

  it("sem coletas no período, explica e sugere ajustar o filtro", async () => {
    mockApi([
      {
        path: "/admin/reports",
        response: success(buildReports({ resumo: { ...buildReports().resumo, totalColetas: 0 } })),
      },
    ]);
    renderWithQuery(<AdminReports />);

    expect(await screen.findByText("Nenhuma coleta no período.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Resumo" })).not.toBeInTheDocument();
  });
});
