import { Building2, Landmark, User } from "lucide-react";
import Link from "next/link";
import collectionContainers from "@/assets/images/collection-containers.webp";
import electronicWastePile from "@/assets/images/electronic-waste-pile.webp";
import phoneRecycling from "@/assets/images/phone-recycling.webp";
import recyclingBin from "@/assets/images/recycling-bin.webp";
import recyclingProcessing from "@/assets/images/recycling-processing.webp";
import sortingCables from "@/assets/images/sorting-cables.webp";
import { EcopointInfo } from "@/components/features/ecopoint/ecopoint-info";
import { CollectionSteps } from "@/components/features/site/collection-steps";
import { RequestCollectionActions } from "@/components/features/site/request-collection-actions";
import {
  CheckList,
  Eyebrow,
  FeatureSplit,
  GradientCta,
  PageHero,
  SectionImage,
  ServiceCards,
  SiteSection,
} from "@/components/features/site/site-blocks";
import { Button } from "@/components/ui/button";
import { INVERSE_OUTLINE } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

// Público-alvo (00_PROJECT_OVERVIEW §6).
const AUDIENCE = ["Moradores de Diadema", "Empresas", "Instituições", "Condomínios", "Pequenos comércios", "Organizações"];

const SERVICES = [
  {
    icon: User,
    title: "Para você",
    description: "Eletrônicos sem uso em casa? Solicite a coleta sem precisar levar nada a lugar nenhum.",
    image: phoneRecycling,
    imageAlt: "Celular com o símbolo de reciclagem sobre peças de eletrônicos descartados.",
    href: "/como-funciona#para-voce",
  },
  {
    icon: Building2,
    title: "Para empresas",
    description: "Empresas e comércios com equipamentos para descartar se cadastram como pessoa jurídica.",
    image: electronicWastePile,
    imageAlt: "Monitores, teclados e computadores antigos amontoados em um galpão.",
    href: "/como-funciona#para-empresas",
  },
  {
    icon: Landmark,
    title: "Para instituições",
    description: "Condomínios e organizações com descarte recorrente também solicitam a coleta pela plataforma.",
    image: recyclingBin,
    imageAlt: "Cesto verde com o símbolo de reciclagem cheio de teclados, cabos e celulares.",
    href: "/como-funciona#para-instituicoes",
  },
].map(({ href, title, ...card }) => ({
  ...card,
  title,
  action: (
    <Button asChild variant="outline">
      <Link href={href}>
        Saiba mais<span className="sr-only">: {title.toLowerCase()}</span>
      </Link>
    </Button>
  ),
}));

// Home institucional (diagrama de navegação, DEC-079; layout DEC-080).
export default function Home() {
  return (
    <>
      <PageHero
        size="home"
        eyebrow="Coleta de lixo eletrônico em Diadema-SP"
        title="Descarte seu lixo eletrônico sem sair de casa"
        description="Você solicita a coleta, a equipe EcoByte recolhe e leva o material ao nosso ecoponto."
        image={recyclingProcessing}
        imageAlt="Linha de triagem com placas de circuito separadas em bandejas."
      >
        <RequestCollectionActions inverse />
        <Button asChild size="lg" variant="outline" className={cn("w-full sm:w-auto", INVERSE_OUTLINE)}>
          <Link href="/como-funciona">Como funciona</Link>
        </Button>
      </PageHero>

      <section aria-labelledby="apresentacao-titulo">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <FeatureSplit
            primary={{ image: collectionContainers, alt: "Contêineres de coleta cheios de equipamentos eletrônicos." }}
            secondary={{ image: sortingCables, alt: "Pessoa de luvas separando cabos e carregadores em caixas de triagem." }}
            highlight={{ title: "Ecoponto próprio", text: "Todo o material vai para o ecoponto EcoByte, em Diadema." }}
          >
            <Eyebrow>EcoByte</Eyebrow>
            <h2 id="apresentacao-titulo" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Do pedido ao ecoponto, sem complicação
            </h2>
            <p className="text-lg text-muted-foreground">
              Uma plataforma digital, uma equipe de coleta e um ecoponto próprio: tudo o que é preciso para o seu lixo
              eletrônico chegar ao lugar certo.
            </p>
            <CheckList items={AUDIENCE} />
            <div className="mt-2">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/sobre">Conheça o projeto</Link>
              </Button>
            </div>
          </FeatureSplit>
        </div>
      </section>

      <SiteSection id="para-quem" eyebrow="Conheça" title="Para quem é o EcoByte" muted centered>
        <ServiceCards cards={SERVICES} />
      </SiteSection>

      <GradientCta
        id="descarte"
        from="muted"
        eyebrow="Descarte responsável"
        title="Seu lixo eletrônico no lugar certo"
        description="Quer que a equipe EcoByte busque os seus eletrônicos?"
        image={sortingCables}
        imageAlt="Pessoa de luvas separando cabos e carregadores em caixas de triagem."
      >
        <RequestCollectionActions />
      </GradientCta>

      <SiteSection
        id="como-funciona"
        eyebrow="Passo a passo"
        title="Como funciona"
        description="Do pedido à entrega no ecoponto, em quatro etapas."
      >
        <CollectionSteps />
        <Link
          href="/como-funciona"
          className="justify-self-start font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver o passo a passo completo
        </Link>
      </SiteSection>

      <SiteSection
        id="ecoponto"
        eyebrow="Ecoponto"
        title="Nosso ecoponto"
        description="O EcoByte opera o próprio ecoponto, para onde vai todo o material recolhido."
        muted
      >
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <SectionImage image={collectionContainers} alt="Contêineres de coleta cheios de equipamentos eletrônicos." />
          <div className="grid gap-4">
            <EcopointInfo />
            <Link href="/ecoponto" className="justify-self-start font-medium text-primary underline-offset-4 hover:underline">
              Mais sobre o ecoponto
            </Link>
          </div>
        </div>
      </SiteSection>
    </>
  );
}
