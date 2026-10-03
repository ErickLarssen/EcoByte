import type { Metadata } from "next";
import collectionContainers from "@/assets/images/collection-containers.webp";
import sortingCables from "@/assets/images/sorting-cables.webp";
import { EcopointInfo } from "@/components/features/ecopoint/ecopoint-info";
import { RequestCollectionActions } from "@/components/features/site/request-collection-actions";
import { GradientCta, PageHero, SiteSection } from "@/components/features/site/site-blocks";

export const metadata: Metadata = {
  title: "Ecoponto",
  description: "Endereço e informações do ecoponto EcoByte em Diadema-SP, para onde vai o material recolhido.",
};

// Ecoponto (diagrama de navegação, DEC-079). O MVP tem um único ecoponto
// central (DEC-002): sem mapa nem lista de ecopontos.
export default function EcopontoPage() {
  return (
    <>
      <PageHero
        eyebrow="Ecoponto"
        title="Ecoponto EcoByte"
        description="Todo o material recolhido pela equipe EcoByte é levado ao nosso ecoponto, em Diadema."
        image={collectionContainers}
        imageAlt="Contêineres de coleta cheios de equipamentos eletrônicos."
      />

      <SiteSection id="detalhes" eyebrow="Onde fica" title="Endereço e informações">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <EcopointInfo />
          <div className="grid gap-4 text-muted-foreground">
            <p>
              Você não precisa levar nada até lá: ao solicitar a coleta, um coletor da equipe EcoByte busca o material no
              endereço informado e faz a entrega no ecoponto.
            </p>
            <p>A entrega é registrada na plataforma, e você acompanha o andamento da sua coleta até a conclusão.</p>
          </div>
        </div>
      </SiteSection>

      <GradientCta
        id="descarte"
        from="background"
        eyebrow="Descarte responsável"
        title="Seu lixo eletrônico no lugar certo"
        description="Quer que a equipe EcoByte busque os seus eletrônicos?"
        image={sortingCables}
        imageAlt="Pessoa de luvas separando cabos e carregadores em caixas de triagem."
      >
        <RequestCollectionActions />
      </GradientCta>
    </>
  );
}
