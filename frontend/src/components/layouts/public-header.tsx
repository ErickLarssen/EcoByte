"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/common/logo";
import { useAuth } from "@/components/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ROLE_HOME } from "@/lib/navigation";
import { SITE_NAVIGATION, type SiteNavItem } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Acesso à conta: o visitante entra ou cria conta; o usuário autenticado
// volta à área do seu perfil (DEC-072).
function AccountActions({ onNavigate, stacked = false }: { onNavigate?: () => void; stacked?: boolean }) {
  const { status, user } = useAuth();

  if (status === "loading") return null;

  if (user) {
    return (
      <Button asChild className={cn(stacked && "w-full")}>
        <Link href={ROLE_HOME[user.role]} onClick={onNavigate}>
          Meu painel
        </Link>
      </Button>
    );
  }

  return (
    <div className={cn("flex gap-2", stacked && "flex-col")}>
      <Button asChild variant="outline" className={cn(stacked && "w-full")}>
        <Link href="/entrar" onClick={onNavigate}>
          Entrar
        </Link>
      </Button>
      <Button asChild className={cn(stacked && "w-full")}>
        <Link href="/cadastro" onClick={onNavigate}>
          Criar conta
        </Link>
      </Button>
    </div>
  );
}

// Dropdown de uma seção: "Visão geral" leva à página; os demais itens, às
// subpáginas do diagrama (DEC-080).
function SectionDropdown({ item, active }: { item: SiteNavItem; active: boolean }) {
  const links = [{ href: item.href, label: "Visão geral", description: undefined }, ...(item.children ?? [])];

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className={cn(active && "bg-accent text-accent-foreground")}>
        {item.label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-80 gap-1 p-1">
          {links.map((link) => (
            <li key={link.href}>
              <NavigationMenuLink asChild>
                <Link href={link.href} className="grid gap-0.5 rounded-md p-3 hover:bg-accent focus:bg-accent">
                  <span className="text-sm font-medium">{link.label}</span>
                  {link.description && <span className="text-sm text-muted-foreground">{link.description}</span>}
                </Link>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

const MOBILE_LINK =
  "flex min-h-12 items-center rounded-lg px-3 font-medium outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground";

// Cabeçalho do site público (11 §76, 12 §14): seções com dropdown no desktop,
// a partir de lg; no celular e no tablet, menu lateral com as subpáginas
// agrupadas (11 §49, DEC-080).
export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo variant="simbolo" className="h-7" />
          <span className="text-lg font-semibold tracking-tight">EcoByte</span>
        </Link>

        <NavigationMenu aria-label="Navegação do site" className="hidden lg:flex" viewport={false}>
          <NavigationMenuList>
            {SITE_NAVIGATION.map((item) => {
              const active = isActive(pathname, item.href);
              if (item.children) return <SectionDropdown key={item.href} item={item} active={active} />;

              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild active={active}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(navigationMenuTriggerStyle(), active && "bg-accent text-accent-foreground")}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden lg:block">
          <AccountActions />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 max-w-[85vw] gap-6 overflow-y-auto p-4 pt-14">
            <SheetHeader className="sr-only p-0">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav aria-label="Navegação do site">
              <ul className="grid gap-1">
                <li>
                  <Link href="/" onClick={close} aria-current={pathname === "/" ? "page" : undefined} className={MOBILE_LINK}>
                    Início
                  </Link>
                </li>
                {SITE_NAVIGATION.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className={MOBILE_LINK}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <ul className="mb-2 ml-3 grid gap-0.5 border-l pl-2" aria-label={item.label}>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={close}
                              className="flex min-h-11 items-center rounded-lg px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <AccountActions stacked onNavigate={close} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
