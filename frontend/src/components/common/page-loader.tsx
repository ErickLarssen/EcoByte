import { Loader2 } from "lucide-react";

// Estado de carregamento de página inteira (10 §55), anunciado a leitores de tela.
export function PageLoader({ label = "Carregando..." }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh flex-col items-center justify-center gap-3 p-4">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
