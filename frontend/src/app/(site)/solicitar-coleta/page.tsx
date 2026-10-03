import { ClipboardCheck, MapPin, PackageOpen } from "lucide-react";
import type { Metadata } from "next";
import phoneRecycling from "@/assets/images/phone-recycling.webp";
import { RequestCollectionActions } from "@/components/features/site/request-collection-actions";
import { PageHero, SiteSection } from "@/components/features/site/site-blocks";

export const metadata: Metadata = {
  title: "Solicitar Coleta",
  description: "Peça a coleta do seu lixo eletrônico em Diadema-SP: informe o endereço e os itens.",
};

// Etapas do formulário de solicitação (DEC-073). Sem data e horário enquanto o
// agendamento estiver em aberto (OQ-020).
const FORM_STEPS = [
  {
    icon: MapPin,
    title: "Endereço",
    description: "Onde a equipe deve retirar o material: logradouro, número, bairro, cidade e CEP.",
  },
  {
    icon: PackageOpen,
    title: "Itens",
    description: "O que será descartado: categoria, quantidade e condição de cada item, além de observações.",
  },
  {
    icon: ClipboardCheck,
    title: "Revisão",
    description: "Confira os dados e confirme. A coleta fica aguardando um coletor, e você acompanha cada etapa.",
  },
];

// Solicitar Coleta no site público (diagrama de navegação, DEC-079). O
// formulário fica na área do cliente (/cliente/coletas/nova).
export default function SolicitarColetaPage() {
  return (
    <>
      <PageHero
        title="Solicitar coleta"
        description="Em poucos passos, você pede a coleta e a equipe EcoByte busca os eletrônicos no seu endereço."
        image={phoneRecycling}
        imageAlt="Celular com o símbolo de reciclagem sobre peças de eletrônicos descartados."
        priority
      >
        <RequestCollectionActions />
      </PageHero>

      <SiteSection
        id="etapas"
        title="Como é a solicitação"
        description="Para solicitar, você precisa de uma conta de cliente, de pessoa física ou jurídica."
      >
        <ol className="grid gap-4 md:grid-cols-3">
          {FORM_STEPS.map((step, index) => (
            <li key={step.title} className="grid content-start gap-3 rounded-xl border bg-card p-5">
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-semibold">
                <span className="sr-only">Etapa {index + 1}: </span>
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          A escolha de data e horário da coleta ainda não está disponível.
        </p>
      </SiteSection>
    </>
  );
}
