import type { Types } from "mongoose";
import type { RecordStatus, TipoCadastro, UserRole } from "../domain/constants.js";

// Dados do usuário exibidos ao administrador (RF-042, 06 §22.2) e ao próprio
// usuário no perfil (RF-011, DEC-078): nunca senhaHash;
// `documento` não é coletado enquanto OQ-044 estiver aberta (DEC-066).
export type UserDetailView = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role: UserRole;
  tipoCadastro: TipoCadastro;
  dadosEmpresa: { razaoSocial: string | null; nomeFantasia: string | null } | null;
  status: RecordStatus;
  // Senha provisória ainda não trocada (DEC-083).
  trocaSenhaObrigatoria: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRecord = {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  telefone?: string | null;
  role: UserRole;
  tipoCadastro: TipoCadastro;
  dadosEmpresa?: { razaoSocial?: string | null; nomeFantasia?: string | null } | null;
  status: RecordStatus;
  trocaSenhaObrigatoria?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toUserDetailView(user: UserRecord): UserDetailView {
  return {
    id: String(user._id),
    nome: user.nome,
    email: user.email,
    telefone: user.telefone ?? null,
    role: user.role,
    tipoCadastro: user.tipoCadastro,
    dadosEmpresa: user.dadosEmpresa
      ? { razaoSocial: user.dadosEmpresa.razaoSocial ?? null, nomeFantasia: user.dadosEmpresa.nomeFantasia ?? null }
      : null,
    status: user.status,
    trocaSenhaObrigatoria: user.trocaSenhaObrigatoria === true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
