import type { ReactNode } from "react";
import { PublicHeader } from "./public-header";
import { SiteFooter } from "./site-footer";

// Layout do site público (11 §76): cabeçalho, conteúdo e rodapé.
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <PublicHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
