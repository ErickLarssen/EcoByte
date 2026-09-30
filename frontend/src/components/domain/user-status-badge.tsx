import type { RecordStatus } from "@/lib/api/admin";
import { USER_STATUS_LABEL } from "@/lib/user-labels";
import { cn } from "@/lib/utils";

// Status do usuário (BR-008): sempre com texto; a cor complementa (12 §33).
export function UserStatusBadge({ status, className }: { status: RecordStatus; className?: string }) {
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        status === "ATIVO" ? "bg-success-surface text-success" : "bg-muted text-muted-foreground ring-1 ring-border",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {USER_STATUS_LABEL[status]}
    </span>
  );
}
