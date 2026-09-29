import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CollectionBase } from "@/lib/api/collections";
import { formatDate, formatStreetLine } from "@/lib/format";
import { CollectionStatusBadge } from "./collection-status-badge";

type CollectionCardProps = {
  collection: CollectionBase;
  href: string;
  // Próxima ação do coletor (13 §44). A ação é executada no detalhe:
  // o card inteiro é um link e não pode conter botões.
  nextAction?: string;
};

// Resumo de uma coleta em listas (11 §53), compartilhado entre perfis (11 §134–§135).
// O card inteiro é o link para o detalhe.
export function CollectionCard({ collection, href, nextAction }: CollectionCardProps) {
  const totalItems = collection.itensDescarte.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="grid min-w-0 flex-1 gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CollectionStatusBadge status={collection.status} />
          <span className="text-sm text-muted-foreground">
            Solicitada em <time dateTime={collection.createdAt}>{formatDate(collection.createdAt)}</time>
          </span>
        </div>
        <p className="truncate font-medium">{formatStreetLine(collection.enderecoColeta)}</p>
        <p className="text-sm text-muted-foreground">
          {collection.enderecoColeta.bairro} · {totalItems} {totalItems === 1 ? "item" : "itens"}
        </p>
        {nextAction && (
          <p className="text-sm font-medium text-primary">
            <span className="text-muted-foreground">Próxima ação: </span>
            {nextAction}
          </p>
        )}
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
