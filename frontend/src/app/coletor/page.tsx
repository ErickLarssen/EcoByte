import type { Metadata } from "next";
import { CollectorDashboard } from "@/components/features/collector/collector-dashboard";

export const metadata: Metadata = { title: "Painel do coletor" };

export default function ColetorHomePage() {
  return <CollectorDashboard />;
}
