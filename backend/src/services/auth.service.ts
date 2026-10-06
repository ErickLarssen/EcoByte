import { isValidObjectId } from "mongoose";
import type { RecordStatus, TipoCadastro, UserRole } from "../domain/constants.js";
import { User, type UserDocument } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import type { LoginInput, RegisterInput } from "../validators/auth.validators.js";

// Dados do usuário expostos pela API (06_API §9.2, 09 §28): nunca senhaHash.
export type PublicUser = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  tipoCadastro: TipoCadastro;
  status: RecordStatus;
  // Campo ausente conta como verificado (DEC-082).
  emailVerificado: boolean;
};

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: String(user._id),
    nome: user.nome,
    email: user.email,
    role: user.role,
    tipoCadastro: user.tipoCadastro,
    status: user.status,
    emailVerificado: user.emailVerificado !== false,
  };
}

const INVALID_CREDENTIALS = () => new AppError(401, "INVALID_CREDENTIALS", "Credenciais inválidas.");

// Hash de referência para equalizar o tempo de resposta quando o e-mail
// não existe, evitando enumeração de contas por tempo (09 §87).
let referenceHash: Promise<string> | undefined;
function getReferenceHash(): Promise<string> {
  referenceHash ??= hashPassword("Referencia@EcoByte#1");
  return referenceHash;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

// Cadastro público (DEC-066): sempre CLIENTE e ATIVO (09 §77), com e-mail a
// confirmar (DEC-082). O envio do link fica com o controller.
export async function registerClient(input: RegisterInput): Promise<PublicUser> {
  if (await User.exists({ email: input.email })) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Este e-mail já está cadastrado.");
  }

  try {
    const user = await User.create({
      nome: input.nome,
      email: input.email,
      senhaHash: await hashPassword(input.senha),
      telefone: input.telefone ?? null,
      role: "CLIENTE",
      tipoCadastro: input.tipoCadastro,
      dadosEmpresa: input.tipoCadastro === "PJ" ? input.dadosEmpresa : null,
      status: "ATIVO",
      // Confirmação por link antes de solicitar coletas (DEC-082).
      emailVerificado: false,
    });

    return toPublicUser(user);
  } catch (error) {
    // Cadastro concorrente com o mesmo e-mail: o índice único decide (BR-005).
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Este e-mail já está cadastrado.");
    }
    throw error;
  }
}

// Login (09 §17): a senha é verificada antes do status, para que
// USER_INACTIVE só seja revelado a quem conhece a senha.
export async function authenticate({ email, senha }: LoginInput): Promise<PublicUser> {
  const user = await User.findOne({ email }).select("+senhaHash");

  if (!user) {
    await verifyPassword(await getReferenceHash(), senha);
    throw INVALID_CREDENTIALS();
  }

  if (!(await verifyPassword(user.senhaHash, senha))) {
    throw INVALID_CREDENTIALS();
  }

  if (user.status !== "ATIVO") {
    throw new AppError(403, "USER_INACTIVE", "Usuário inativo.");
  }

  return toPublicUser(user);
}

// Usuário da sessão, recarregado do banco a cada requisição protegida
// para refletir desativações e mudanças de role imediatamente.
export async function findSessionUser(userId: string): Promise<PublicUser | null> {
  if (!isValidObjectId(userId)) return null;

  const user = await User.findById(userId);
  return user ? toPublicUser(user) : null;
}
