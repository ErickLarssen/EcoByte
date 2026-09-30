import { Clock, Info } from "lucide-react";
import type { Ecopoint } from "@/lib/api/ecopoint";
import { AddressCard } from "./address-card";

// Ecoponto central (11 §61). Horários ainda não são exibidos: o formato está
// em aberto (OQ-005). Mapa e navegação dependem de requisito (11 §60, OQ-031).
export function EcopointCard({ ecopoint }: { ecopoint: Ecopoint }) {
  const inactive = ecopoint.status === "INATIVO";

  return (
    <article className="grid gap-4 rounded-xl border bg-card p-4 sm:p-5" aria-labelledby="ecoponto-nome">
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
    </article>
  );
}
