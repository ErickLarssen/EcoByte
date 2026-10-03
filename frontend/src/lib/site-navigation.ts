// Seções principais do site público, na ordem do diagrama de navegação
// (public/images/diagrama-navegacao.png, DEC-079). "Home" é o logotipo.
export type SiteNavItem = { href: string; label: string };

export const SITE_NAVIGATION: SiteNavItem[] = [
  { href: "/sobre", label: "Sobre o Projeto" },
  { href: "/ecoponto", label: "Ecoponto" },
  { href: "/solicitar-coleta", label: "Solicitar Coleta" },
  { href: "/como-funciona", label: "Como Funciona" },
];

// Destino de "Solicitar coleta" depois do login ou cadastro.
export const REQUEST_COLLECTION_PATH = "/cliente/coletas/nova";
