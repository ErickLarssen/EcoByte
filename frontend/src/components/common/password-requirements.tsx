import { Check, Circle } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

// Requisitos de senha (11 §14, 10 §41). O estado de cada item é comunicado
// por ícone e por texto oculto, não apenas por cor (12 §32).
export function PasswordRequirements({ value, id }: { value: string; id?: string }) {
  return (
    <ul id={id} className="grid gap-1 text-sm" aria-label="Requisitos da senha">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);

        return (
          <li
            key={rule.id}
            data-met={met}
            className={cn("flex items-center gap-2", met ? "text-success" : "text-muted-foreground")}
          >
            {met ? (
              <Check className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {rule.label}
              <span className="sr-only">{met ? " (atendido)" : " (pendente)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
