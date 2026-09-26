import type { Types } from "mongoose";
import type { CollectionStatus } from "../domain/collection-status.js";
import type { EnderecoComLocalizacao } from "../models/schemas/endereco.schema.js";

type UserRef = Types.ObjectId | { _id: Types.ObjectId; nome?: string; telefone?: string | null } | null;

// Documento de coleta como retornado por consultas lean, com referências
// opcionalmente populadas.
export type CollectionRecord = {
  _id: Types.ObjectId;
  usuarioId: UserRef;
  coletorId: UserRef;
  status: CollectionStatus;
  enderecoColeta: EnderecoComLocalizacao;
  itensDescarte: Array<{ categoria: string; quantidade: number; condicao: string }>;
  dataAgendada?: Date | null;
  observacoes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date | null;
  startedAt?: Date | null;
  collectedAt?: Date | null;
  deliveredAt?: Date | null;
  completedAt?: Date | null;
};

function refId(ref: UserRef): string | null {
  if (!ref) return null;
  return "_id" in ref ? String(ref._id) : String(ref);
}

function populated(ref: UserRef): { nome?: string; telefone?: string | null } | null {
  return ref && "_id" in ref && "nome" in ref ? ref : null;
}

// Campos comuns às duas visões (06_API §13.4). Identificadores internos
// (usuarioId, coletorId, ecopontoId) não fazem parte da resposta (DEC-070).
function baseView(collection: CollectionRecord) {
  return {
    id: String(collection._id),
    status: collection.status,
    enderecoColeta: {
      logradouro: collection.enderecoColeta.logradouro,
      numero: collection.enderecoColeta.numero,
      complemento: collection.enderecoColeta.complemento ?? null,
      bairro: collection.enderecoColeta.bairro,
      cidade: collection.enderecoColeta.cidade,
      estado: collection.enderecoColeta.estado,
      cep: collection.enderecoColeta.cep,
      localizacao: collection.enderecoColeta.localizacao ?? null,
    },
    itensDescarte: collection.itensDescarte.map(({ categoria, quantidade, condicao }) => ({
      categoria,
      quantidade,
      condicao,
    })),
    dataAgendada: collection.dataAgendada ?? null,
    observacoes: collection.observacoes ?? null,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    acceptedAt: collection.acceptedAt ?? null,
    startedAt: collection.startedAt ?? null,
    collectedAt: collection.collectedAt ?? null,
    deliveredAt: collection.deliveredAt ?? null,
    completedAt: collection.completedAt ?? null,
  };
}

export type ClientCollectionView = ReturnType<typeof baseView> & { coletor: { nome: string } | null };
export type CollectorCollectionView = ReturnType<typeof baseView> & {
  cliente: { nome: string; telefone: string | null } | null;
};

// Visão do cliente: somente o nome do coletor responsável (DEC-070).
export function toClientView(collection: CollectionRecord): ClientCollectionView {
  const coletor = populated(collection.coletorId);

  return {
    ...baseView(collection),
    coletor: coletor?.nome ? { nome: coletor.nome } : null,
  };
}

// Visão do coletor: nome e telefone do cliente somente nas coletas
// atribuídas ao próprio coletor; em coletas PENDENTE, nenhum dado pessoal (DEC-070).
export function toCollectorView(collection: CollectionRecord, coletorId: string): CollectorCollectionView {
  const cliente = populated(collection.usuarioId);
  const assignedToMe = refId(collection.coletorId) === coletorId;

  return {
    ...baseView(collection),
    cliente: assignedToMe && cliente?.nome ? { nome: cliente.nome, telefone: cliente.telefone ?? null } : null,
  };
}
