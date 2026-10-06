// Área de atendimento das coletas (CLAUDE.md §1, DEC-081): somente Diadema-SP.
export const SERVICE_AREA = { cidade: "Diadema", estado: "SP" } as const;

export const OUTSIDE_SERVICE_AREA_MESSAGE = "Atendemos apenas endereços em Diadema-SP.";

// Compara sem diferenciar maiúsculas, acentos e espaços extras.
function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

export function isWithinServiceArea(cidade: string, estado: string): boolean {
  return normalize(cidade) === normalize(SERVICE_AREA.cidade) && normalize(estado) === normalize(SERVICE_AREA.estado);
}
