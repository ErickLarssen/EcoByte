import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Pagination as PaginationData } from "@/lib/api/collections";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  pagination: PaginationData;
  hrefForPage: (page: number) => string;
};

// Navegação entre páginas de resultados (11 §42), refletindo a paginação da API.
// Anterior/Próxima são links reais: funcionam com teclado e com o histórico.
export function Pagination({ pagination, hrefForPage }: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  const linkClass = cn(buttonVariants({ variant: "outline" }), "min-w-11");
  const disabledClass = cn(linkClass, "pointer-events-none opacity-50");

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-3">
      {pagination.hasPreviousPage ? (
        <Link href={hrefForPage(pagination.page - 1)} className={linkClass} rel="prev">
          <ChevronLeft aria-hidden="true" data-icon="inline-start" />
          Anterior
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          <ChevronLeft aria-hidden="true" data-icon="inline-start" />
          Anterior
        </span>
      )}

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Página {pagination.page} de {pagination.totalPages}
      </p>

      {pagination.hasNextPage ? (
        <Link href={hrefForPage(pagination.page + 1)} className={linkClass} rel="next">
          Próxima
          <ChevronRight aria-hidden="true" data-icon="inline-end" />
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Próxima
          <ChevronRight aria-hidden="true" data-icon="inline-end" />
        </span>
      )}
    </nav>
  );
}
