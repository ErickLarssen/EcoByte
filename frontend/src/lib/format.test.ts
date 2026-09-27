import { describe, expect, it } from "vitest";
import {
  NOT_INFORMED,
  formatCep,
  formatCityLine,
  formatDate,
  formatDateTime,
  formatLabel,
  formatStreetLine,
} from "./format";

const address = {
  logradouro: "Rua das Palmeiras",
  numero: "120",
  complemento: "Casa 2",
  bairro: "Centro",
  cidade: "Diadema",
  estado: "SP",
  cep: "09900001",
};

describe("formatação centralizada (11 §118)", () => {
  it("formata datas em pt-BR no fuso de São Paulo", () => {
    // 02:30 UTC ainda é dia 20 em São Paulo (UTC-3).
    expect(formatDate("2026-09-21T02:30:00.000Z")).toMatch(/20 de set\.? de 2026/);
    expect(formatDateTime("2026-09-20T13:05:00.000Z")).toMatch(/20 de set\.? de 2026.*10:05/);
  });

  it("usa 'Não informado' para datas ausentes ou inválidas (11 §126)", () => {
    expect(formatDate(null)).toBe(NOT_INFORMED);
    expect(formatDateTime("data-invalida")).toBe(NOT_INFORMED);
  });

  it("formata CEP com hífen", () => {
    expect(formatCep("09900001")).toBe("09900-001");
    expect(formatCep("123")).toBe("123");
  });

  it("monta as linhas do endereço, com e sem complemento", () => {
    expect(formatStreetLine(address)).toBe("Rua das Palmeiras, 120 — Casa 2");
    expect(formatStreetLine({ ...address, complemento: null })).toBe("Rua das Palmeiras, 120");
    expect(formatCityLine(address)).toBe("Centro, Diadema/SP · CEP 09900-001");
  });

  it("apresenta valores em maiúsculas da API de forma legível", () => {
    expect(formatLabel("DANIFICADO")).toBe("Danificado");
    expect(formatLabel("ENTREGUE_ECOPONTO")).toBe("Entregue ecoponto");
  });
});
