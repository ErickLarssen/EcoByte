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
  nome = `Usuário ${role}`,
  telefone = null,
}: {
  email: string;
  role?: Role;
  status?: "ATIVO" | "INATIVO";
  senha?: string;
  nome?: string;
  telefone?: string | null;
}) {
  return User.create({
    nome,
    email,
    senhaHash: await hashPassword(senha),
    telefone,
    role,
    tipoCadastro: "PF",
    status,
  });
}

let fakeIpCounter = 0;

// Agente com cookie de sessão após login bem-sucedido.
// Cada login usa um X-Forwarded-For distinto: em apps com trustProxy=1 isso
// simula clientes diferentes para o rate limit (DEC-067/DEC-068); com
// trustProxy=0 o header é ignorado.
export async function loginAgent(app: Express, email: string, senha = VALID_PASSWORD) {
  const agent = request.agent(app);
  fakeIpCounter += 1;
  const response = await agent
    .post("/api/v1/auth/login")
    .set("X-Forwarded-For", `198.51.100.${fakeIpCounter % 250}`)
    .send({ email, senha });

  if (response.status !== 200) {
    throw new Error(`Login de teste falhou (${response.status}): ${JSON.stringify(response.body)}`);
  }

  return agent;
}

export function sessionCookie(setCookie: string[] | string | undefined): string | undefined {
  const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  return cookies.find((cookie) => cookie.startsWith("ecobyte.sid="));
}
