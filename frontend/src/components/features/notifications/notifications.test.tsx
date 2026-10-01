import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationBell } from "@/components/layouts/notification-bell";
import type { AppNotification } from "@/lib/api/notifications";
import { failure, mockApi, paginated, renderWithQuery, success } from "@/test/utils";
import { NotificationCenter } from "./notification-center";

const navigation = vi.hoisted(() => ({ search: "", pathname: "/cliente" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  navigation.search = "";
  navigation.pathname = "/cliente";
});

function buildNotification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: "n1",
    tipo: "COLETA_ACEITA",
    titulo: "Coleta aceita",
    mensagem: "Um coletor EcoByte aceitou a sua coleta.",
    referencia: { tipo: "COLETA", id: "c1" },
    lida: false,
    createdAt: "2026-09-30T13:00:00.000Z",
    ...overrides,
  };
}

const LIST = "/notifications?page=1&limit=10";

// API simulada com estado: o PATCH marca a notificação como lida.
function mockNotificationsApi(initial: AppNotification[]) {
  let items = initial;
  return mockApi([
    { path: LIST, response: () => success(paginated(items)) },
    ...initial.map((notification) => ({
      method: "PATCH",
      path: `/notifications/${notification.id}/read`,
      response: () => {
        items = items.map((item) => (item.id === notification.id ? { ...item, lida: true } : item));
        return success({ notification: { ...notification, lida: true } });
      },
    })),
  ]);
}

describe("NotificationCenter (RF-048, 11 §51)", () => {
  it("lista as notificações com estado de leitura em texto e link para a coleta", async () => {
    mockNotificationsApi([
      buildNotification(),
      buildNotification({ id: "n2", titulo: "Material recolhido", lida: true, referencia: { tipo: "COLETA", id: "c2" } }),
    ]);
    renderWithQuery(<NotificationCenter path="/cliente/notificacoes" collectionsPath="/cliente/coletas" />);

    const unread = await screen.findByRole("article", { name: /Coleta aceita/ });
    expect(within(unread).getByText("Não lida")).toBeInTheDocument();
    expect(within(unread).getByRole("link", { name: /Ver coleta/ })).toHaveAttribute("href", "/cliente/coletas/c1");
    expect(within(unread).getByRole("button", { name: "Marcar como lida" })).toBeInTheDocument();

    const read = screen.getByRole("article", { name: /Material recolhido/ });
    expect(within(read).queryByText("Não lida")).not.toBeInTheDocument();
    expect(within(read).queryByRole("button", { name: "Marcar como lida" })).not.toBeInTheDocument();
  });

  it("marca como lida e recarrega a lista da API", async () => {
    const user = userEvent.setup();
    const { calls } = mockNotificationsApi([buildNotification()]);
    renderWithQuery(<NotificationCenter path="/cliente/notificacoes" collectionsPath="/cliente/coletas" />);

    await user.click(await screen.findByRole("button", { name: "Marcar como lida" }));

    expect(await screen.findByRole("article", { name: "Coleta aceita" })).toBeInTheDocument();
    expect(screen.queryByText("Não lida")).not.toBeInTheDocument();
    expect(calls.filter((call) => call.method === "PATCH").map((call) => call.path)).toEqual([
      "/api/v1/notifications/n1/read",
    ]);
  });

  it("abrir a coleta também marca a notificação como lida", async () => {
    const user = userEvent.setup();
    const { calls } = mockNotificationsApi([buildNotification()]);
    renderWithQuery(<NotificationCenter path="/coletor/notificacoes" collectionsPath="/coletor/coletas" />);

    const link = await screen.findByRole("link", { name: /Ver coleta/ });
    expect(link).toHaveAttribute("href", "/coletor/coletas/c1");
    await user.click(link);

    expect(calls.some((call) => call.method === "PATCH")).toBe(true);
  });

  it("sem notificações, mostra estado vazio", async () => {
    mockApi([{ path: LIST, response: success(paginated([])) }]);
    renderWithQuery(<NotificationCenter path="/cliente/notificacoes" collectionsPath="/cliente/coletas" />);

    expect(await screen.findByText("Você não tem notificações.")).toBeInTheDocument();
  });

  it("erro ao carregar oferece nova tentativa", async () => {
    mockApi([{ path: LIST, response: failure(500, "INTERNAL_SERVER_ERROR", "Erro.") }]);
    renderWithQuery(<NotificationCenter path="/cliente/notificacoes" collectionsPath="/cliente/coletas" />);

    expect(await screen.findByText("Não foi possível carregar suas notificações.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tentar novamente/ })).toBeInTheDocument();
  });
});

describe("NotificationBell (12 §14, §57)", () => {
  const UNREAD = "/notifications?page=1&limit=1&lida=false";

  it("anuncia o número de não lidas no nome acessível", async () => {
    mockApi([{ path: UNREAD, response: success(paginated([buildNotification()], 1, 1, 3)) }]);
    renderWithQuery(<NotificationBell href="/cliente/notificacoes" />);

    const bell = await screen.findByRole("link", { name: "Notificações, 3 não lidas" });
    expect(bell).toHaveAttribute("href", "/cliente/notificacoes");
    expect(within(bell).getByText("3")).toHaveAttribute("aria-hidden", "true");
  });

  it("sem não lidas, não mostra contador", async () => {
    const { calls } = mockApi([{ path: UNREAD, response: success(paginated([], 1, 1, 0)) }]);
    renderWithQuery(<NotificationBell href="/cliente/notificacoes" />);

    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Notificações" })).toBeInTheDocument();
  });

  it("consulta o contador periodicamente (OQ-012, DEC-077)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { calls } = mockApi([{ path: UNREAD, response: success(paginated([], 1, 1, 0)) }]);
      renderWithQuery(<NotificationBell href="/cliente/notificacoes" />);

      await vi.waitFor(() => expect(calls).toHaveLength(1));
      await vi.advanceTimersByTimeAsync(60_000);
      await vi.waitFor(() => expect(calls).toHaveLength(2));
    } finally {
      vi.useRealTimers();
    }
  });
});
