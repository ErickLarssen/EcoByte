import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

// Ausência de dados (11 §32, 10 §54): explica o estado e sugere a próxima ação.
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary/20 bg-card/80 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-accent text-secondary-foreground ring-1 ring-brand-green/15">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="grid gap-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground text-balance">{description}</p>}
      </div>
      {action}
    </div>
  );
}
