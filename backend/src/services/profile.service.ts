import { Types } from "mongoose";
import { User } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import type { ChangePasswordInput, UpdateProfileInput } from "../validators/profile.validators.js";
import { toUserDetailView, type UserDetailView, type UserRecord } from "./user.views.js";

// O usuário vem sempre da sessão, nunca de um id enviado (05 RT-005).
const notFound = () => new AppError(404, "RESOURCE_NOT_FOUND", "Usuário não encontrado.");

export async function getProfile(userId: string): Promise<UserDetailView> {
  const user = await User.findById(new Types.ObjectId(userId)).lean();
  if (!user) throw notFound();
  return toUserDetailView(user as unknown as UserRecord);
}

// Alteração parcial dos dados permitidos (RF-012, DEC-078). As coletas guardam
// o endereço da solicitação, que não é afetado (RF-013, DEC-008).
export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDetailView> {
  const current = await User.findById(new Types.ObjectId(userId)).select("tipoCadastro").lean();
  if (!current) throw notFound();

  if (input.dadosEmpresa && current.tipoCadastro !== "PJ") {
    throw new AppError(400, "VALIDATION_ERROR", "Existem campos inválidos.", {
      dadosEmpresa: "Dados empresariais se aplicam somente a cadastros PJ.",
    });
  }

  const changes: Record<string, unknown> = {};
  if (input.nome !== undefined) changes.nome = input.nome;
  if (input.telefone !== undefined) changes.telefone = input.telefone;
  if (input.dadosEmpresa) {
    changes.dadosEmpresa = {
      razaoSocial: input.dadosEmpresa.razaoSocial,
      nomeFantasia: input.dadosEmpresa.nomeFantasia ?? null,
    };
  }

  const updated = await User.findByIdAndUpdate(current._id, { $set: changes }, {
    returnDocument: "after",
    runValidators: true,
  }).lean();

  if (!updated) throw notFound();
  return toUserDetailView(updated as unknown as UserRecord);
}

// Troca de senha (DEC-078). Senha atual incorreta responde 400 no próprio
// campo: não é falha de sessão, e o usuário continua autenticado.
export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await User.findById(new Types.ObjectId(userId)).select("+senhaHash");
  if (!user) throw notFound();

  if (!(await verifyPassword(user.senhaHash, input.senhaAtual))) {
    throw new AppError(400, "VALIDATION_ERROR", "Existem campos inválidos.", { senhaAtual: "Senha atual incorreta." });
  }

  if (await verifyPassword(user.senhaHash, input.novaSenha)) {
    throw new AppError(400, "VALIDATION_ERROR", "Existem campos inválidos.", {
      novaSenha: "A nova senha deve ser diferente da atual.",
    });
  }

  user.senhaHash = await hashPassword(input.novaSenha);
  await user.save();
}
