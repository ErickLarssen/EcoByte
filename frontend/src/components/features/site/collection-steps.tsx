import { StepList } from "./site-blocks";

// O fluxo principal do EcoByte (00_PROJECT_OVERVIEW §3).
export const COLLECTION_STEPS = [
  {
    title: "Você solicita",
    description: "Informe pela plataforma o endereço e os eletrônicos que quer descartar.",
  },
  {
    title: "A equipe EcoByte recolhe",
    description: "Um coletor da equipe aceita a solicitação e vai até o endereço buscar o material.",
  },
  {
    title: "O material é encaminhado",
    description: "O coletor leva os itens recolhidos até o ecoponto EcoByte, em Diadema.",
  },
  {
    title: "Descarte concluído",
    description: "A entrega é registrada no ecoponto e você acompanha cada etapa pela plataforma.",
  },
];

export function CollectionSteps() {
  return <StepList steps={COLLECTION_STEPS} />;
}
