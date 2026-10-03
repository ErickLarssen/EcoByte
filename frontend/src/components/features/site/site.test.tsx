import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegistrationForm } from "@/components/features/auth/registration-form";
import { LoginForm } from "@/components/features/auth/login-form";
import { PublicHeader } from "@/components/layouts/public-header";
import { directionsUrl } from "@/lib/maps";
import { withReturnParam } from "@/lib/navigation";
import { adminUser, clienteUser, coletorUser, failure, mockApi, renderWithAuth, success } from "@/test/utils";
import { RequestCollectionActions } from "./request-collection-actions";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  navigation.pathname = "/";
});

const anonymous = () => mockApi([{ path: "/auth/me", response: failure(401, "UNAUTHORIZED", "Autenticação necessária.") }]);
const loggedAs = (user: object) => mockApi([{ path: "/auth/me", response: success({ user }) }]);

describe("PublicHeader (diagrama de navegação, DEC-079)", () => {
  it("mostra as seções na ordem do diagrama: dropdowns e links diretos, com a atual marcada", async () => {
    anonymous();
    navigation.pathname = "/ecoponto";
    renderWithAuth(<PublicHeader />);

    const nav = screen.getAllByRole("navigation", { name: "Navegação do site" })[0]!;
    const items = within(nav)
      .getAllByRole("listitem")
      .map((item) => item.querySelector("a, button")?.textContent?.trim());
    expect(items).toEqual(["Sobre o Projeto", "Ecoponto", "Solicitar Coleta", "Como Funciona"]);
    expect(within(nav).getByRole("button", { name: "Sobre o Projeto" })).toHaveAttribute("aria-expanded", "false");
    expect(within(nav).getByRole("link", { name: "Ecoponto" })).toHaveAttribute("aria-current", "page");
    expect(await screen.findByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
  });

  it("o dropdown abre a visão geral e as subpáginas do diagrama (DEC-080)", async () => {
    const user = userEvent.setup();
    anonymous();
    renderWithAuth(<PublicHeader />);

    const nav = screen.getAllByRole("navigation", { name: "Navegação do site" })[0]!;
    await user.click(within(nav).getByRole("button", { name: "Como Funciona" }));

    expect(within(nav).getByRole("button", { name: "Como Funciona" })).toHaveAttribute("aria-expanded", "true");
    expect(await within(nav).findByRole("link", { name: /Visão geral/ })).toHaveAttribute("href", "/como-funciona");
    expect(within(nav).getByRole("link", { name: /Dúvidas frequentes/ })).toHaveAttribute("href", "/como-funciona#duvidas");
    expect(within(nav).getByRole("link", { name: /Para empresas/ })).toHaveAttribute("href", "/como-funciona#para-empresas");
  });

  it("usuário autenticado vê 'Meu painel' da sua área", async () => {
    loggedAs(coletorUser);
    renderWithAuth(<PublicHeader />);

    expect(await screen.findByRole("link", { name: "Meu painel" })).toHaveAttribute("href", "/coletor");
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
  });

  it("no celular, o menu abre com as seções e o acesso à conta (11 §49)", async () => {
    const user = userEvent.setup();
    anonymous();
    renderWithAuth(<PublicHeader />);

    await user.click(screen.getByRole("button", { name: "Abrir menu" }));

    const dialog = await screen.findByRole("dialog", { name: "Menu" });
    expect(within(dialog).getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    expect(within(dialog).getByRole("link", { name: "Sobre o Projeto" })).toHaveAttribute("href", "/sobre");
    const sobre = within(dialog).getByRole("list", { name: "Sobre o Projeto" });
    expect(within(sobre).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Quem somos",
      "Nossa missão",
      "Impacto ambiental",
      "Equipe",
    ]);
    expect(await within(dialog).findByRole("link", { name: "Criar conta" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Fechar" })).toBeInTheDocument();
  });
});

describe("RequestCollectionActions (RF-014, DEC-079)", () => {
  it("visitante cria conta ou entra e volta ao formulário de solicitação", async () => {
    anonymous();
    renderWithAuth(<RequestCollectionActions />);

    expect(await screen.findByRole("link", { name: "Criar conta e solicitar" })).toHaveAttribute(
      "href",
      "/cadastro?proximo=%2Fcliente%2Fcoletas%2Fnova",
    );
    expect(screen.getByRole("link", { name: "Já tenho conta" })).toHaveAttribute(
      "href",
      "/entrar?proximo=%2Fcliente%2Fcoletas%2Fnova",
    );
  });

  it("cliente vai direto ao formulário", async () => {
    loggedAs(clienteUser);
    renderWithAuth(<RequestCollectionActions />);

    expect(await screen.findByRole("link", { name: /Solicitar coleta/ })).toHaveAttribute("href", "/cliente/coletas/nova");
  });

  it("coletor e administrador são informados e levados ao próprio painel", async () => {
    loggedAs(adminUser);
    renderWithAuth(<RequestCollectionActions />);

    expect(await screen.findByText("A solicitação de coleta é feita com uma conta de cliente.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o meu painel" })).toHaveAttribute("href", "/admin");
  });
});

describe("directionsUrl — Como chegar (DEC-079)", () => {
  const endereco = {
    logradouro: "Avenida EcoByte",
    numero: "100",
    complemento: null,
    bairro: "Centro",
    cidade: "Diadema",
    estado: "SP",
    cep: "09900000",
  };

  it("usa as coordenadas na ordem latitude,longitude (GeoJSON é [lng, lat])", () => {
    const url = directionsUrl({ endereco, localizacao: { type: "Point", coordinates: [-46.6228, -23.6812] } });
    expect(url).toBe("https://www.google.com/maps/dir/?api=1&destination=-23.6812%2C-46.6228");
  });

  it("sem coordenadas, usa o endereço", () => {
    const url = new URL(directionsUrl({ endereco, localizacao: null }));
    expect(url.searchParams.get("destination")).toBe("Avenida EcoByte, 100, Centro, Diadema - SP, 09900-000");
  });
});

describe("cadastro e login a partir do site (DEC-079)", () => {
  it("withReturnParam mantém só destinos internos", () => {
    expect(withReturnParam("/entrar", "/cliente/coletas/nova")).toBe("/entrar?proximo=%2Fcliente%2Fcoletas%2Fnova");
    expect(withReturnParam("/entrar", "https://site.com")).toBe("/entrar");
    expect(withReturnParam("/entrar", null)).toBe("/entrar");
  });

  it("?tipo=PJ abre o cadastro com Pessoa jurídica selecionada", () => {
    anonymous();
    renderWithAuth(<RegistrationForm initialTipo="PJ" returnTo="/cliente/coletas/nova" />);

    expect(screen.getByRole("radio", { name: /Pessoa jurídica/ })).toBeChecked();
    expect(screen.getByLabelText(/Razão social/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar?proximo=%2Fcliente%2Fcoletas%2Fnova");
  });

  it("o login mantém o destino no link para o cadastro", () => {
    anonymous();
    renderWithAuth(<LoginForm returnTo="/cliente/coletas/nova" />);

    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute(
      "href",
      "/cadastro?proximo=%2Fcliente%2Fcoletas%2Fnova",
    );
  });
});
