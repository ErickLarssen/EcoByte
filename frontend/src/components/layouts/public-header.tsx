"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/common/logo";
import { useAuth } from "@/components/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ROLE_HOME } from "@/lib/navigation";
import { SITE_NAVIGATION } from "@/lib/site-navigation";
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

const MOBILE_LINK =
  "flex h-12 items-center rounded-lg px-3 font-medium outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground";

// Cabeçalho do site público (11 §76, 12 §14): seções no desktop, a partir de
// lg; no celular e no tablet, menu lateral (11 §49).
export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo variant="simbolo" className="h-7" />
          <span className="text-lg font-semibold tracking-tight">EcoByte</span>
        </Link>

        <nav aria-label="Navegação do site" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SITE_NAVIGATION.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
                      active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <AccountActions />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 max-w-[85vw] gap-6 p-4 pt-14">
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
