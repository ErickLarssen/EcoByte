import type { Metadata } from "next";
import { EcopointInfo } from "@/components/features/ecopoint/ecopoint-info";

export const metadata: Metadata = { title: "Ecoponto" };

export default function ClienteEcopontoPage() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ecoponto</h1>
        <p className="text-muted-foreground">Para onde a equipe EcoByte leva o material recolhido.</p>
      </div>
      <EcopointInfo />
    </div>
  );
}
