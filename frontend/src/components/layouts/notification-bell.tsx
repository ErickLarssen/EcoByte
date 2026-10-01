"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

function unreadLabel(count: number | undefined): string {
  if (!count) return "Notificações";
  return `Notificações, ${count} ${count === 1 ? "não lida" : "não lidas"}`;
}

// Acesso às notificações no cabeçalho (12 §14), com o número de não lidas.
// O nome acessível inclui o contador (12 §57); o número visual é decorativo.
export function NotificationBell({ href }: { href: string }) {
  const { data: count } = useUnreadCount();
  const active = usePathname() === href;

  return (
    <Link
      href={href}
      aria-label={unreadLabel(count)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-lg outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 md:size-10",
        active && "bg-accent text-accent-foreground",
      )}
    >
      <Bell className="size-5" aria-hidden="true" />
      {count ? (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.7rem] leading-none font-semibold text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
