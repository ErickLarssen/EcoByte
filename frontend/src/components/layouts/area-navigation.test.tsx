import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AREA_NAVIGATION, MobileNavigation, activeHref } from "./area-navigation";

const navigation = vi.hoisted(() => ({ pathname: "/cliente" }));

vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

const items = AREA_NAVIGATION.cliente;

beforeEach(() => {
  navigation.pathname = "/cliente";
});

describe("navegação da área do cliente (DEC-073)", () => {
  it.each([
    ["/cliente", "/cliente"],
    ["/cliente/coletas", "/cliente/coletas"],
    ["/cliente/coletas/abc123", "/cliente/coletas"],
    ["/cliente/coletas/nova", "/cliente/coletas/nova"],
  ])("em %s o item ativo é %s", (pathname, expected) => {
    expect(activeHref(items, pathname)).toBe(expected);
  });

  it("marca o item ativo com aria-current=page (não só por cor)", () => {
    navigation.pathname = "/cliente/coletas/nova";
    render(<MobileNavigation items={items} />);

    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Início", "Minhas coletas", "Solicitar"]);
    expect(within(nav).getByRole("link", { name: "Solicitar" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Minhas coletas" })).not.toHaveAttribute("aria-current");
  });
});

describe("navegação da área do coletor (DEC-074)", () => {
  const coletorItems = AREA_NAVIGATION.coletor;

  it.each([
    ["/coletor", "/coletor"],
    ["/coletor/disponiveis", "/coletor/disponiveis"],
    ["/coletor/coletas", "/coletor/coletas"],
    ["/coletor/coletas/abc123", "/coletor/coletas"],
  ])("em %s o item ativo é %s", (pathname, expected) => {
    expect(activeHref(coletorItems, pathname)).toBe(expected);
  });

  it("lista Início, Disponíveis e Minhas coletas", () => {
    navigation.pathname = "/coletor/disponiveis";
    render(<MobileNavigation items={coletorItems} />);

    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(within(nav).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Início",
      "Disponíveis",
      "Minhas coletas",
    ]);
    expect(within(nav).getByRole("link", { name: "Disponíveis" })).toHaveAttribute("aria-current", "page");
  });
});

describe("navegação da área administrativa (DEC-075)", () => {
  const adminItems = AREA_NAVIGATION.admin;

  it.each([
    ["/admin", "/admin"],
    ["/admin/usuarios", "/admin/usuarios"],
    ["/admin/usuarios/u1", "/admin/usuarios"],
    ["/admin/coletas", "/admin/coletas"],
    ["/admin/coletas/k1", "/admin/coletas"],
  ])("em %s o item ativo é %s", (pathname, expected) => {
    expect(activeHref(adminItems, pathname)).toBe(expected);
  });

  it("lista Início, Usuários e Coletas", () => {
    expect(adminItems.map((item) => item.label)).toEqual(["Início", "Usuários", "Coletas"]);
  });
});
