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
