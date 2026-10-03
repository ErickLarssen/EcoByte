import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import electronicWastePile from "@/assets/images/electronic-waste-pile.webp";
import recyclingProcessing from "@/assets/images/recycling-processing.webp";
import { PageHero, SectionImage, SiteSection } from "@/components/features/site/site-blocks";

export const metadata: Metadata = {
  title: "Sobre o Projeto",
  description: "Quem somos, nossa missão e o impacto do descarte correto de lixo eletrônico em Diadema-SP.",
};

// Princípios do produto (00_PROJECT_OVERVIEW §15).
const PRINCIPLES = [
  { title: "Simplicidade", description: "Poucos passos entre ter um eletrônico parado e vê-lo recolhido." },
  { title: "Transparência", description: "Você sabe em que etapa está a sua solicitação." },
  { title: "Conveniência", description: "A equipe EcoByte vai até você: não é preciso transportar o material." },
  { title: "Confiabilidade", description: "Cada coleta fica com um único coletor responsável." },
  { title: "Responsabilidade", description: "Todo o processo é registrado, da solicitação à entrega no ecoponto." },
];

// Sobre o Projeto (diagrama de navegação, DEC-079). Textos provisórios,
// baseados em 00_PROJECT_OVERVIEW; equipe e indicadores de impacto ainda
// não foram definidos e não são inventados (OQ-069).
export default function SobrePage() {
  return (
    <>
      <PageHero
        title="Sobre o projeto"
        description="O EcoByte facilita o descarte correto de lixo eletrônico em Diadema-SP, reunindo plataforma digital, equipe de coleta e ecoponto próprio."
        image={recyclingProcessing}
        imageAlt="Linha de triagem com placas de circuito separadas em bandejas."
        priority
      />

      <SiteSection id="quem-somos" title="Quem somos">
        <div className="grid max-w-3xl gap-4 text-muted-foreground">
          <p>
            O EcoByte é uma plataforma para solicitar a coleta de resíduos eletroeletrônicos em Diadema-SP. Ele cumpre
            três papéis ao mesmo tempo: é a plataforma digital onde você faz o pedido, a equipe que recolhe o material e
            o ecoponto físico que o recebe.
          </p>
          <p>
            Pessoas, empresas e instituições usam a mesma plataforma para pedir a coleta e acompanhar cada etapa até a
            entrega no ecoponto.
          </p>
        </div>
      </SiteSection>

      <SiteSection
        id="missao"
        title="Nossa missão"
        description="Facilitar o caminho entre quem tem lixo eletrônico e o lugar certo para descartá-lo."
        muted
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title} className="flex gap-3 rounded-xl border bg-card p-5">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="grid gap-1">
                <h3 className="font-semibold">{principle.title}</h3>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </SiteSection>

      <SiteSection id="impacto" title="Impacto ambiental">
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div className="grid gap-4 text-muted-foreground">
            <p>
              Eletrônicos guardados sem uso ou jogados no lixo comum deixam de chegar a um destino adequado. Muitas
              vezes isso acontece por falta de um caminho prático: saber para onde levar e como transportar.
            </p>
            <p>
              O EcoByte reduz esse atrito: o material é recolhido no endereço informado e registrado na entrega ao
              ecoponto. Os indicadores de impacto serão publicados aqui quando houver dados registrados pela operação.
            </p>
          </div>
          <SectionImage image={electronicWastePile} alt="Monitores, teclados e computadores antigos amontoados em um galpão." />
        </div>
      </SiteSection>

      <SiteSection id="equipe" title="Equipe" muted>
        <p className="max-w-3xl text-muted-foreground">
          O EcoByte é um projeto acadêmico desenvolvido por estudantes. As informações sobre os integrantes da equipe
          serão publicadas em breve.
        </p>
      </SiteSection>
    </>
  );
}
