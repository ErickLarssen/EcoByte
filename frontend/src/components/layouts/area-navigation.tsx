"use client";

import { ClipboardList, House, Inbox, PlusCircle, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type Area = "cliente" | "coletor" | "admin";

// Destinos de cada área (DEC-073, DEC-074, DEC-075, 10 §58, §62).
export const AREA_NAVIGATION: Record<Area, NavItem[]> = {
  cliente: [
    { href: "/cliente", label: "Início", icon: House },
    { href: "/cliente/coletas", label: "Minhas coletas", icon: ClipboardList },
    { href: "/cliente/coletas/nova", label: "Solicitar", icon: PlusCircle },
  ],
  coletor: [
    { href: "/coletor", label: "Início", icon: House },
    { href: "/coletor/disponiveis", label: "Disponíveis", icon: Inbox },
    { href: "/coletor/coletas", label: "Minhas coletas", icon: ClipboardList },
  ],
  admin: [
    { href: "/admin", label: "Início", icon: House },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/coletas", label: "Coletas", icon: ClipboardList },
  ],
};

// Item ativo: o destino mais específico que corresponde à URL atual
// (ex.: /cliente/coletas/nova ativa "Solicitar", não "Minhas coletas").
export function activeHref(items: NavItem[], pathname: string): string | undefined {
  return items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function useActiveHref(items: NavItem[]) {
  return activeHref(items, usePathname());
}

// Links no cabeçalho, a partir de md.
export function DesktopNavigation({ items }: { items: NavItem[] }) {
  const active = useActiveHref(items);
  if (items.length === 0) return null;

  return (
    <nav aria-label="Navegação principal" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.href === active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
                item.href === active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Barra inferior fixa no celular (DEC-073), ao alcance do polegar.
export function MobileNavigation({ items }: { items: NavItem[] }) {
  const active = useActiveHref(items);
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const isActive = item.href === active;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium outline-none focus-visible:bg-accent",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("size-5", isActive && "stroke-[2.5]")} aria-hidden="true" />
                <span className={cn(isActive && "font-semibold")}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
