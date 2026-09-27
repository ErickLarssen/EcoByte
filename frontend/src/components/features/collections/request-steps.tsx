import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const REQUEST_STEPS = ["Endereço", "Itens", "Revisão"] as const;

// Indicador de progresso do fluxo (12 §55): etapa atual, concluídas e
// restantes, com alternativa textual para leitores de tela.
export function RequestSteps({ current }: { current: number }) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
        Etapa {current + 1} de {REQUEST_STEPS.length}: {REQUEST_STEPS[current]}
      </p>
      <ol className="grid grid-cols-3 gap-2" aria-label="Etapas da solicitação">
        {REQUEST_STEPS.map((label, index) => {
          const state = index < current ? "completed" : index === current ? "current" : "upcoming";

          return (
            <li key={label} aria-current={state === "current" ? "step" : undefined} className="grid gap-1.5">
              <span
                aria-hidden="true"
                className={cn("h-1.5 rounded-full", state === "upcoming" ? "bg-border" : "bg-primary")}
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  state === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {state === "completed" && <Check className="size-3.5 text-primary" aria-hidden="true" />}
                {label}
                <span className="sr-only">
                  {state === "completed" ? " (concluída)" : state === "current" ? " (atual)" : " (pendente)"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
