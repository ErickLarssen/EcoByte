import type { AdminUser } from "./admin";
import { apiRequest } from "./client";

// Perfil do usuário autenticado (06_API §11, DEC-078): a mesma representação
// de usuário da área administrativa, sem senha nem documento.
export type Profile = AdminUser;

// Somente os campos editáveis (OQ-041, DEC-078). Vazio ou null remove o valor.
export type UpdateProfilePayload = Partial<{
  nome: string;
  telefone: string | null;
  dadosEmpresa: { razaoSocial: string; nomeFantasia: string | null };
}>;

export type ChangePasswordPayload = {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
};

export async function getProfile(signal?: AbortSignal): Promise<Profile> {
  const { data } = await apiRequest<{ user: Profile }>("/profile", { signal });
  return data.user;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const { data } = await apiRequest<{ user: Profile }>("/profile", { method: "PATCH", body: payload });
  return data.user;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiRequest<null>("/profile/password", { method: "PATCH", body: payload });
}
