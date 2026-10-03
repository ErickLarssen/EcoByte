import { Building2, Landmark, User } from "lucide-react";
import Link from "next/link";
import collectionContainers from "@/assets/images/collection-containers.webp";
import recyclingProcessing from "@/assets/images/recycling-processing.webp";
import sortingCables from "@/assets/images/sorting-cables.webp";
import { EcopointInfo } from "@/components/features/ecopoint/ecopoint-info";
import { CollectionSteps } from "@/components/features/site/collection-steps";
import { RequestCollectionActions } from "@/components/features/site/request-collection-actions";
import { PageHero, SectionImage, SiteSection } from "@/components/features/site/site-blocks";
import { Button } from "@/components/ui/button";

const AUDIENCES = [
  {
    icon: User,
    title: "Para você",
    description: "Eletrônicos sem uso em casa? Solicite a coleta sem precisar levar nada a lugar nenhum.",
    href: "/como-funciona#para-voce",
  },
  {
    icon: Building2,
    title: "Para empresas",
    description: "Empresas e comércios com equipamentos para descartar se cadastram como pessoa jurídica.",
    href: "/como-funciona#para-empresas",
  },
  {
    icon: Landmark,
    title: "Para instituições",
    description: "Condomínios e organizações com descarte recorrente também solicitam a coleta pela plataforma.",
    href: "/como-funciona#para-instituicoes",
  },
];

// Home institucional (diagrama de navegação, DEC-079): apresenta o EcoByte e
// leva às seções principais.
export default function Home() {
  return (
    <>
      <PageHero
        title="Descarte seu lixo eletrônico sem sair de casa"
        description="Você solicita a coleta, a equipe EcoByte recolhe e leva o material ao nosso ecoponto em Diadema."
        image={sortingCables}
        imageAlt="Pessoa de luvas separando cabos e carregadores em caixas de triagem."
        priority
      >
        <RequestCollectionActions />
        <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
          <Link href="/como-funciona">Como funciona</Link>
        </Button>
      </PageHero>

      <SiteSection id="como-funciona" title="Como funciona" description="Do pedido à entrega no ecoponto, em quatro etapas.">
        <CollectionSteps />
        <Link
          href="/como-funciona"
          className="justify-self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver o passo a passo completo
        </Link>
      </SiteSection>

      <SiteSection id="para-quem" title="Para quem é o EcoByte" muted>
        <ul className="grid gap-4 md:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <li key={audience.title}>
              <Link
                href={audience.href}
                className="grid h-full gap-3 rounded-xl border bg-card p-5 outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <audience.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-semibold">{audience.title}</span>
                <span className="text-sm text-muted-foreground">{audience.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </SiteSection>

      <SiteSection
        id="ecoponto"
        title="Nosso ecoponto"
        description="O EcoByte opera o próprio ecoponto, para onde vai todo o material recolhido."
      >
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <SectionImage image={collectionContainers} alt="Contêineres de coleta cheios de equipamentos eletrônicos." />
          <div className="grid gap-4">
            <EcopointInfo />
            <Link
              href="/ecoponto"
              className="justify-self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Mais sobre o ecoponto
            </Link>
          </div>
        </div>
      </SiteSection>

      <SiteSection id="sobre" title="Sobre o projeto" muted>
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div className="grid gap-4">
            <p className="text-muted-foreground">
              Descartar eletrônicos do jeito certo costuma dar trabalho: descobrir para onde levar, transportar o
              material e acompanhar o processo. O EcoByte junta tudo em um só lugar: uma plataforma digital, uma equipe
              de coleta e um ecoponto próprio.
            </p>
            <Button asChild variant="outline" className="w-full sm:w-auto sm:justify-self-start">
              <Link href="/sobre">Conheça o projeto</Link>
            </Button>
          </div>
          <SectionImage image={recyclingProcessing} alt="Linha de triagem com placas de circuito separadas em bandejas." />
        </div>
      </SiteSection>
    </>
  );
}
