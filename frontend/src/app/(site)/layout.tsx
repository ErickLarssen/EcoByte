import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";

// Site público (DEC-079): Home, Sobre o Projeto, Ecoponto, Solicitar Coleta e
// Como Funciona, com cabeçalho e rodapé institucionais.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
