// Página atual das listas, lida da URL (?pagina=2), para permitir voltar e
// compartilhar o link (11 §42).
export const PAGE_PARAM = "pagina";

export function pageFromParams(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}
