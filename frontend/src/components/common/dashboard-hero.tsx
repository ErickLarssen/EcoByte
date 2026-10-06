import Image from "next/image";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/features/site/site-blocks";
import { cn } from "@/lib/utils";

type DashboardHeroProps = {
  // Nome da área, acima da saudação (ex.: "Área do cliente").
  eyebrow: string;
  firstName?: string;
  description: string;
  // Ação principal do painel (ex.: "Solicitar coleta").
  action?: ReactNode;
  // Totais logo abaixo, sobrepostos à borda inferior a partir de sm.
  withTiles?: boolean;
};

// Abertura dos painéis (10 §65–§67, DEC-085): a linguagem escura do rodapé e
// do hero do site (DEC-080), com o símbolo da marca como marca d'água. A
// saudação é o título da página (`#boas-vindas`).
export function DashboardHero({ eyebrow, firstName, description, action, withTiles = false }: DashboardHeroProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-foreground px-5 py-7 text-white shadow-lg shadow-foreground/10 sm:px-8 sm:py-9",
        withTiles && "sm:pb-20",
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-foreground via-foreground to-primary/70"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-brand-green opacity-20 blur-3xl"
      />
      <Image
        src="/brand/ecobyte-mark.png"
        alt=""
        width={491}
        height={242}
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -bottom-8 -z-10 w-64 max-w-none opacity-[0.08] sm:w-80"
      />

      <div className="grid gap-5 sm:flex sm:items-end sm:justify-between">
        <div className="grid max-w-xl gap-2">
          <Eyebrow className="text-brand-green">{eyebrow}</Eyebrow>
          <h1 id="boas-vindas" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Olá{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="text-white/80 text-pretty">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
