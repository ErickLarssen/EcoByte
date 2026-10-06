import { apiRequest } from "./client";

export type UserRole = "CLIENTE" | "COLETOR" | "ADMIN";
export type TipoCadastro = "PF" | "PJ";

// Usuário público retornado pela API (06_API §9.2).
export type User = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  tipoCadastro: TipoCadastro;
  status: "ATIVO" | "INATIVO";
  // false até o cliente confirmar o e-mail pelo link (DEC-082).
  emailVerificado: boolean;
  // Senha provisória definida pelo admin, ainda não trocada (DEC-083).
  trocaSenhaObrigatoria: boolean;
};

export type LoginPayload = {
  email: string;
  senha: string;
};

// Contrato do cadastro público (DEC-066).
export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
  tipoCadastro: TipoCadastro;
  telefone?: string;
  dadosEmpresa?: { razaoSocial: string; nomeFantasia?: string };
};

type UserResponse = { user: User };

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await apiRequest<UserResponse>("/auth/login", { method: "POST", body: payload });
  return data.user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiRequest<UserResponse>("/auth/register", { method: "POST", body: payload });
  return data.user;
}

export async function logout(): Promise<void> {
  await apiRequest<null>("/auth/logout", { method: "POST" });
}

export async function getCurrentUser(signal?: AbortSignal): Promise<User> {
  const { data } = await apiRequest<UserResponse>("/auth/me", { signal });
  return data.user;
}

// Verificação de e-mail (DEC-082). Pública: o link pode ser aberto em outro navegador.
export async function verifyEmail(token: string): Promise<void> {
  await apiRequest<null>("/auth/verify-email", { method: "POST", body: { token } });
}

// Novo link para o usuário da sessão.
export async function resendVerificationEmail(): Promise<string> {
  const { message } = await apiRequest<null>("/auth/verify-email/resend", { method: "POST" });
  return message;
}
