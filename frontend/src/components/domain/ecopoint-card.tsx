import { Clock, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Ecopoint } from "@/lib/api/ecopoint";
import { directionsUrl } from "@/lib/maps";
import { AddressCard } from "./address-card";

// Ecoponto central (11 §61). Horários ainda não são exibidos: o formato está
// em aberto (OQ-005). Sem mapa embutido: "Como chegar" abre um app de mapas
// externo (11 §60, OQ-031, DEC-079).
export function EcopointCard({ ecopoint }: { ecopoint: Ecopoint }) {
  const inactive = ecopoint.status === "INATIVO";

  return (
    <article className="grid gap-4 surface-card p-4 sm:p-6" aria-labelledby="ecoponto-nome">
      <header className="grid gap-1">
        <h2 id="ecoponto-nome" className="text-lg font-semibold">
          {ecopoint.nome}
        </h2>
        {ecopoint.descricao && <p className="text-sm text-muted-foreground break-words">{ecopoint.descricao}</p>}
      </header>

      {/* Ecoponto inativo não é apresentado como disponível (BR-038). */}
      {inactive && (
        <p className="flex gap-2 rounded-lg bg-warning-surface px-3 py-2 text-sm text-warning">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Temporariamente sem receber materiais.
        </p>
      )}

      <AddressCard address={ecopoint.endereco} />

      <p className="flex gap-3 text-sm text-muted-foreground">
        <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        Horários de funcionamento a definir.
      </p>

      <Button asChild variant="outline" className="w-full sm:w-auto sm:justify-self-start">
        <a href={directionsUrl(ecopoint)} target="_blank" rel="noopener noreferrer">
          Como chegar
          <ExternalLink aria-hidden="true" data-icon="inline-end" />
          <span className="sr-only"> (abre o mapa em uma nova aba)</span>
        </a>
      </Button>
    </article>
  );
}
