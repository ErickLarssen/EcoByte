import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

// Falha ao carregar uma seção (11 §33, 10 §57), com nova tentativa.
export function ErrorState({ title, message, onRetry, retrying }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-error-surface text-error">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <div className="grid gap-1">
        <p className="font-semibold">{title}</p>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} loading={retrying}>
          {!retrying && <RotateCw aria-hidden="true" data-icon="inline-start" />}
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
