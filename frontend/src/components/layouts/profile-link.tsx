"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/api/auth";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Acesso ao perfil no cabeçalho (12 §14, DEC-078). Até lg, só o
// ícone; a partir de xl, também nome (truncado) e perfil.
export function ProfileLink({ user }: { user: User }) {
  const href = `${ROLE_HOME[user.role]}/perfil`;
  const active = usePathname() === href;

  return (
    <Link
      href={href}
      aria-label={`Meu perfil: ${user.nome}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 lg:h-10 lg:min-w-10",
        active && "bg-accent text-accent-foreground",
      )}
    >
      <span className="hidden max-w-40 text-right xl:block" aria-hidden="true">
        <span className="block truncate text-sm leading-tight font-medium">{user.nome}</span>
        <span className="block text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
      </span>
      <UserRound className="size-5" aria-hidden="true" />
    </Link>
  );
}
