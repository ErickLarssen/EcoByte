import type { ItemDescarte } from "@/lib/api/collections";
import { formatLabel, formatQuantity } from "@/lib/format";

// Itens de descarte da coleta (11 §57–§58).
export function WasteItemsList({ items }: { items: ItemDescarte[] }) {
  return (
    <ul className="grid gap-2" aria-label="Itens de descarte">
      {items.map((item, index) => (
        <li
          key={`${item.categoria}-${index}`}
          className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="font-medium break-words">{formatLabel(item.categoria)}</p>
            <p className="text-sm text-muted-foreground">Condição: {formatLabel(item.condicao)}</p>
          </div>
          <p className="shrink-0 text-sm">
            <span className="sr-only">Quantidade: </span>
            <span className="font-semibold">{formatQuantity(item.quantidade)}</span>
            <span className="text-muted-foreground"> {item.quantidade === 1 ? "unidade" : "unidades"}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
