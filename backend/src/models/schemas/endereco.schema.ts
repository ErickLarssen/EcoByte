import { Schema } from "mongoose";
import { geoPointSchema, type GeoPoint } from "./geo-point.schema.js";
import { required } from "./validators.js";

export type Endereco = {
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

export type EnderecoComLocalizacao = Endereco & {
  localizacao?: GeoPoint | null;
};

// Campos de endereço (DEC-061). CEP com 8 dígitos sem hífen e UF com
// 2 letras, conforme os exemplos de 07_DATABASE_MONGODB.
const enderecoFields = {
  logradouro: { type: String, required: required("logradouro é obrigatório."), trim: true },
  numero: { type: String, required: required("numero é obrigatório."), trim: true },
  complemento: { type: String, trim: true, default: null },
  bairro: { type: String, required: required("bairro é obrigatório."), trim: true },
  cidade: { type: String, required: required("cidade é obrigatória."), trim: true },
  estado: {
    type: String,
    required: required("estado é obrigatório."),
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2}$/, "estado deve ser a sigla da UF com 2 letras."] as [RegExp, string],
  },
  cep: {
    type: String,
    required: required("cep é obrigatório."),
    trim: true,
    match: [/^\d{8}$/, "cep deve conter 8 dígitos, sem hífen."] as [RegExp, string],
  },
};

// Endereço do ecoponto: a localização fica no próprio documento do ecoponto.
export const enderecoSchema = new Schema<Endereco>(enderecoFields, { _id: false });

// Endereço da coleta: snapshot histórico embutido, com localização opcional (DEC-008).
export const enderecoColetaSchema = new Schema<EnderecoComLocalizacao>(
  {
    ...enderecoFields,
    localizacao: { type: geoPointSchema, default: null },
  },
  { _id: false },
);
