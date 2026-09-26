import type { Express } from "express";
import request from "supertest";
import { User } from "../../src/models/index.js";
import { hashPassword } from "../../src/utils/password.js";

export const VALID_PASSWORD = "Senha@123";

export const validPF = {
  nome: "Mariana Teste",
  email: "mariana@teste.local",
  senha: VALID_PASSWORD,
  confirmacaoSenha: VALID_PASSWORD,
  tipoCadastro: "PF",
};

export const validPJ = {
  nome: "Responsável Empresa",
  email: "empresa@teste.local",
  senha: VALID_PASSWORD,
  confirmacaoSenha: VALID_PASSWORD,
  tipoCadastro: "PJ",
  dadosEmpresa: { razaoSocial: "Empresa Teste Ltda.", nomeFantasia: "Empresa Teste" },
};

type Role = "CLIENTE" | "COLETOR" | "ADMIN";

// Cria um usuário direto no banco (COLETOR e ADMIN não têm cadastro público).
export async function createUser({
  email,
  role = "CLIENTE",
  status = "ATIVO",
  senha = VALID_PASSWORD,
}: {
  email: string;
  role?: Role;
  status?: "ATIVO" | "INATIVO";
  senha?: string;
}) {
  return User.create({
    nome: `Usuário ${role}`,
    email,
    senhaHash: await hashPassword(senha),
    role,
    tipoCadastro: "PF",
    status,
  });
}

// Agente com cookie de sessão após login bem-sucedido.
export async function loginAgent(app: Express, email: string, senha = VALID_PASSWORD) {
  const agent = request.agent(app);
  const response = await agent.post("/api/v1/auth/login").send({ email, senha });

  if (response.status !== 200) {
    throw new Error(`Login de teste falhou (${response.status}): ${JSON.stringify(response.body)}`);
  }

  return agent;
}

export function sessionCookie(setCookie: string[] | string | undefined): string | undefined {
  const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  return cookies.find((cookie) => cookie.startsWith("ecobyte.sid="));
}
