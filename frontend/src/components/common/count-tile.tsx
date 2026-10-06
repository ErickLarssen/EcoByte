import { ArrowUpRight, type LucideIcon } from "lucide-react";
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
// Cartão de métrica elevado (10 §43, DEC-085); o hover é só reforço (10 §76).
export function CountTile({ href, label, icon: Icon, value, failed = false }: CountTileProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 overflow-hidden surface-card surface-card-interactive p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-brand-green opacity-0 transition-opacity group-hover:opacity-100"
      />
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-accent text-secondary-foreground ring-1 ring-brand-green/15">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <span className="grid flex-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        {value !== undefined ? (
          <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
        ) : failed ? (
          <span className="text-sm text-muted-foreground">Indisponível</span>
        ) : (
          <>
            <span className="sr-only">Carregando...</span>
            <Skeleton className="mt-1 h-8 w-12" aria-hidden="true" />
          </>
        )}
      </span>
      <ArrowUpRight
        className="size-5 shrink-0 self-start text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}
