// Formatação centralizada de datas, CEP e endereços (11 §118, 10 §86).

export const NOT_INFORMED = "Não informado";

const TIME_ZONE = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Ex.: "27 de set. de 2026"
export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : NOT_INFORMED;
}

// Ex.: "27 de set. de 2026, 14:30"
export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : NOT_INFORMED;
}

// "09900001" → "09900-001"
export function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : cep;
}

export type AddressLike = {
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

// Linha principal: "Rua das Palmeiras, 120 — Casa 2"
export function formatStreetLine(address: AddressLike): string {
  const base = `${address.logradouro}, ${address.numero}`;
  return address.complemento ? `${base} — ${address.complemento}` : base;
}

// Linha secundária: "Centro, Diadema/SP · CEP 09900-001"
export function formatCityLine(address: AddressLike): string {
  return `${address.bairro}, ${address.cidade}/${address.estado} · CEP ${formatCep(address.cep)}`;
}

// Categoria/condição vêm em maiúsculas da API: "DANIFICADO" → "Danificado".
export function formatLabel(value: string): string {
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatQuantity(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}
