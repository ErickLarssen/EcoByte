import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type CountTileProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  // Total vindo da API; undefined enquanto carrega.
  value: number | undefined;
  failed?: boolean;
};

// Total de uma lista nos painéis (13 §43), levando à lista correspondente.
export function CountTile({ href, label, icon: Icon, value, failed = false }: CountTileProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="grid">
        <span className="text-sm text-muted-foreground">{label}</span>
        {value !== undefined ? (
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
        ) : failed ? (
          <span className="text-sm text-muted-foreground">Indisponível</span>
        ) : (
          <>
            <span className="sr-only">Carregando...</span>
            <Skeleton className="mt-1 h-7 w-10" aria-hidden="true" />
          </>
        )}
      </span>
    </Link>
  );
}
