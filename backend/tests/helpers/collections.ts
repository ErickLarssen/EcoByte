import type { Types } from "mongoose";
import { Collection, Ecopoint } from "../../src/models/index.js";

export const validCollectionBody = {
  enderecoColeta: {
    logradouro: "Rua das Palmeiras",
    numero: "120",
    complemento: "Casa 2",
    bairro: "Centro",
    cidade: "Diadema",
    estado: "SP",
    cep: "09900001",
  },
  itensDescarte: [
    { categoria: "INFORMATICA", quantidade: 2, condicao: "USADO" },
    { categoria: "CELULARES", quantidade: 1, condicao: "DANIFICADO" },
  ],
  observacoes: "Portão azul.",
};

// Coleta PENDENTE criada direto no banco, com data de criação controlada.
export function insertPendingCollection(usuarioId: Types.ObjectId, createdAt = new Date()) {
  return Collection.create({
    usuarioId,
    enderecoColeta: validCollectionBody.enderecoColeta,
    itensDescarte: validCollectionBody.itensDescarte,
    createdAt,
    updatedAt: createdAt,
  });
}

export function insertActiveEcopoint() {
  return Ecopoint.create({
    nome: "Ecoponto Central EcoByte",
    endereco: {
      logradouro: "Avenida EcoByte",
      numero: "100",
      bairro: "Centro",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900000",
    },
    localizacao: { type: "Point", coordinates: [-46.6228, -23.6812] },
    status: "ATIVO",
  });
}
