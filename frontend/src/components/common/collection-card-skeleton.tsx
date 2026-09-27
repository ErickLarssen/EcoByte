import { Skeleton } from "@/components/ui/skeleton";

// Estrutura de carregamento das listas de coletas (10 §56).
export function CollectionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-3">
      <span className="sr-only">Carregando coletas...</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className="grid gap-2 rounded-xl border bg-card p-4">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
