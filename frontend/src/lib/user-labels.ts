import type { RecordStatus } from "./api/admin";
import type { TipoCadastro } from "./api/auth";

// Rótulos de exibição dos dados de usuário (10 §92). ROLE_LABEL fica em navigation.ts.
export const USER_STATUS_LABEL: Record<RecordStatus, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export const TIPO_CADASTRO_LABEL: Record<TipoCadastro, string> = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};
