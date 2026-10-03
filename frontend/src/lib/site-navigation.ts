// Seções principais do site público, na ordem do diagrama de navegação
// (public/images/diagrama-navegacao.png, DEC-079). "Home" é o logotipo.
// As subpáginas do diagrama são seções da página, acessadas por âncora, e
// aparecem em dropdown no desktop e agrupadas no menu do celular (DEC-080).
export type SiteNavLink = { href: string; label: string; description?: string };
export type SiteNavItem = SiteNavLink & { children?: SiteNavLink[] };

export const SITE_NAVIGATION: SiteNavItem[] = [
  {
    href: "/sobre",
    label: "Sobre o Projeto",
    children: [
      { href: "/sobre#quem-somos", label: "Quem somos", description: "Plataforma, equipe de coleta e ecoponto próprio." },
      { href: "/sobre#missao", label: "Nossa missão", description: "Os princípios que guiam o EcoByte." },
      { href: "/sobre#impacto", label: "Impacto ambiental", description: "Por que o descarte correto importa." },
      { href: "/sobre#equipe", label: "Equipe", description: "Quem faz o projeto." },
    ],
  },
  { href: "/ecoponto", label: "Ecoponto" },
  { href: "/solicitar-coleta", label: "Solicitar Coleta" },
  {
    href: "/como-funciona",
    label: "Como Funciona",
    children: [
      { href: "/como-funciona#passo-a-passo", label: "Passo a passo", description: "Do pedido à entrega no ecoponto." },
      { href: "/como-funciona#para-voce", label: "Para você", description: "Coleta para pessoas físicas." },
      { href: "/como-funciona#para-empresas", label: "Para empresas", description: "Cadastro como pessoa jurídica." },
      {
        href: "/como-funciona#para-instituicoes",
        label: "Para instituições",
        description: "Condomínios e organizações.",
      },
      { href: "/como-funciona#duvidas", label: "Dúvidas frequentes", description: "Respostas rápidas sobre a coleta." },
    ],
  },
];

// Botão secundário sobre foto escura (hero): contorno claro e translúcido.
// Fica fora de módulos "use client" para poder ser usado também em páginas de servidor.
export const INVERSE_OUTLINE = "border-white/60 bg-white/10 text-white hover:bg-white/20 hover:text-white";

// Destino de "Solicitar coleta" depois do login ou cadastro.
export const REQUEST_COLLECTION_PATH = "/cliente/coletas/nova";
