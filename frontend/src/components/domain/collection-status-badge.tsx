import { STATUS_INFO, type CollectionStatus, type StatusTone } from "@/lib/collection-status";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<StatusTone, string> = {
  warning: "bg-warning-surface text-warning",
  info: "bg-info-surface text-info",
  positive: "bg-success-surface text-success",
  success: "bg-success text-white",
};

// Status da coleta (11 §25): sempre com texto; a cor complementa (10 §87, 12 §33).
export function CollectionStatusBadge({ status, className }: { status: CollectionStatus; className?: string }) {
  const info = STATUS_INFO[status];

  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        TONE_CLASSES[info.tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {info.label}
    </span>
  );
}
