// Sugestões PROVISÓRIAS para o formulário de solicitação (DEC-073).
// Vêm dos exemplos do seed (20_SEED_DATA §17–§18) e NÃO são listas oficiais:
// categorias (OQ-007) e condições (OQ-010) continuam em aberto, e o cliente
// pode digitar outros valores. O valor enviado é o mesmo do seed, para não
// gerar variações da mesma categoria nos relatórios.

export const CATEGORY_SUGGESTIONS = [
  { value: "INFORMATICA", label: "Informática" },
  { value: "COMPUTADORES", label: "Computadores" },
  { value: "MONITORES", label: "Monitores" },
  { value: "PERIFERICOS", label: "Periféricos" },
  { value: "CELULARES", label: "Celulares" },
  { value: "ELETRONICOS", label: "Eletrônicos" },
  { value: "CABOS", label: "Cabos" },
] as const;

export const CONDITION_SUGGESTIONS = [
  { value: "USADO", label: "Usado" },
  { value: "DANIFICADO", label: "Danificado" },
  { value: "OBSOLETO", label: "Obsoleto" },
] as const;
