import { MapPin } from "lucide-react";
import { formatCityLine, formatStreetLine, type AddressLike } from "@/lib/format";

// Endereço formatado (11 §59), usado em coletas e, futuramente, no ecoponto.
export function AddressCard({ address }: { address: AddressLike }) {
  return (
    <address className="flex gap-3 not-italic">
      <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-medium break-words">{formatStreetLine(address)}</p>
        <p className="text-sm text-muted-foreground">{formatCityLine(address)}</p>
      </div>
    </address>
  );
}
