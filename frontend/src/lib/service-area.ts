// Área de atendimento (DEC-081). Espelha backend/src/domain/service-area.ts;
// a API é a validação definitiva (DEC-040).
export const SERVICE_AREA = { cidade: "Diadema", estado: "SP" } as const;

export const OUTSIDE_SERVICE_AREA_MESSAGE = "Atendemos apenas endereços em Diadema-SP.";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

export function isWithinServiceArea(cidade: string, estado: string): boolean {
  return normalize(cidade) === normalize(SERVICE_AREA.cidade) && normalize(estado) === normalize(SERVICE_AREA.estado);
}
