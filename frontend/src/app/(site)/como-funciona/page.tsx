import type { Metadata } from "next";
import Link from "next/link";
import recyclingBin from "@/assets/images/recycling-bin.webp";
import sortingCables from "@/assets/images/sorting-cables.webp";
import { CollectionSteps } from "@/components/features/site/collection-steps";
import { RequestCollectionActions } from "@/components/features/site/request-collection-actions";
import { GradientCta, PageHero, SiteSection } from "@/components/features/site/site-blocks";
import { CollectionStatusBadge } from "@/components/domain/collection-status-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { COLLECTION_STATUSES, STATUS_INFO } from "@/lib/collection-status";

export const metadata: Metadata = {
  title: "Como Funciona",
  description: "Passo a passo da coleta de lixo eletrônico do EcoByte para pessoas, empresas e instituições.",
};

// Respostas baseadas somente em regras já definidas; o que ainda está em
// aberto é informado como indisponível (DEC-079).
const FAQ = [
  {
    question: "Onde o EcoByte atende?",
    answer: "Inicialmente, em Diadema-SP.",
  },
  {
    question: "Quais itens posso descartar?",
    answer:
      "Equipamentos eletrônicos e eletroeletrônicos. Na solicitação, você informa a categoria, a quantidade e a condição de cada item.",
  },
  {
    question: "Preciso levar o material até o ecoponto?",
    answer:
      "Não. Um coletor da equipe EcoByte busca o material no endereço informado e faz a entrega no ecoponto.",
  },
  {
    question: "Posso escolher a data e o horário da coleta?",
    answer: "Ainda não. Por enquanto, a solicitação é feita sem agendamento e fica aguardando um coletor da equipe.",
  },
  {
    question: "Como acompanho a minha coleta?",
    answer:
      "Pela plataforma: cada solicitação mostra a etapa atual e a linha do tempo. Você também recebe uma notificação a cada etapa.",
  },
  {
    question: "Empresas e instituições podem solicitar?",
    answer: "Sim. Basta fazer o cadastro como pessoa jurídica, informando a razão social.",
  },
  {
    question: "Posso cancelar uma solicitação?",
    answer: "O cancelamento ainda não está disponível pela plataforma.",
  },
];

// Como Funciona (diagrama de navegação, DEC-079): passo a passo, públicos e dúvidas frequentes.
export default function ComoFuncionaPage() {
  return (
    <>
      <PageHero
        eyebrow="Como funciona"
        title="Você pede, a EcoByte recolhe"
        description="Você pede a coleta pela plataforma, a equipe EcoByte recolhe o material e o leva ao nosso ecoponto."
        image={recyclingBin}
        imageAlt="Cesto verde com o símbolo de reciclagem cheio de teclados, cabos e celulares."
      >
        <RequestCollectionActions inverse />
      </PageHero>

      <SiteSection id="passo-a-passo" eyebrow="Do pedido ao ecoponto" title="Passo a passo">
        <CollectionSteps />
        <div className="grid gap-3">
          <h3 className="font-semibold">As etapas que você acompanha</h3>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTION_STATUSES.map((status) => (
              <li key={status} className="grid content-start gap-2 rounded-xl border bg-card p-4">
                <CollectionStatusBadge status={status} className="justify-self-start" />
                <p className="text-sm text-muted-foreground">{STATUS_INFO[status].description}</p>
              </li>
            ))}
          </ol>
        </div>
      </SiteSection>

      <SiteSection id="para-voce" title="Para você" muted>
        <div className="grid max-w-3xl gap-4 text-muted-foreground">
          <p>
            Crie sua conta como pessoa física, informe o endereço e os eletrônicos que quer descartar. A equipe EcoByte
            cuida do resto: busca o material e leva ao ecoponto.
          </p>
          <Button asChild className="w-full sm:w-auto sm:justify-self-start">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </SiteSection>

      <SiteSection id="para-empresas" title="Para empresas">
        <div className="grid max-w-3xl gap-4 text-muted-foreground">
          <p>
            Empresas e comércios se cadastram como pessoa jurídica, com razão social e nome fantasia, e solicitam a
            coleta dos equipamentos que não usam mais.
          </p>
          <Button asChild variant="outline" className="w-full sm:w-auto sm:justify-self-start">
            <Link href="/cadastro?tipo=PJ">Cadastrar empresa</Link>
          </Button>
        </div>
      </SiteSection>

      <SiteSection id="para-instituicoes" title="Para instituições" muted>
        <div className="grid max-w-3xl gap-4 text-muted-foreground">
          <p>
            Condomínios e organizações com descarte recorrente também usam o cadastro de pessoa jurídica e acompanham
            todas as solicitações em um só lugar.
          </p>
          <Button asChild variant="outline" className="w-full sm:w-auto sm:justify-self-start">
            <Link href="/cadastro?tipo=PJ">Cadastrar instituição</Link>
          </Button>
        </div>
      </SiteSection>

      <SiteSection id="duvidas" eyebrow="Dúvidas" title="Dúvidas frequentes">
        <Accordion type="single" collapsible className="max-w-3xl rounded-xl border bg-card px-4">
          {FAQ.map((item, index) => (
            <AccordionItem key={item.question} value={`pergunta-${index}`}>
              <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
