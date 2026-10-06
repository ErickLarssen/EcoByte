import type { Metadata } from "next";
import { EcopointInfo } from "@/components/features/ecopoint/ecopoint-info";

export const metadata: Metadata = { title: "Ecoponto" };

// Ecoponto de entrega do material recolhido (BR-034, DEC-084).
export default function ColetorEcopontoPage() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ecoponto</h1>
        <p className="text-muted-foreground">Onde entregar o material recolhido nas suas coletas.</p>
      </div>
      <EcopointInfo />
    </div>
  );
}
