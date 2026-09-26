import argon2 from "argon2";

// Módulo único de hash de senha (DEC-020: Argon2id com os parâmetros
// padrão da biblioteca). Reutilizado por cadastro, redefinição e seed.

export function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

export async function verifyPassword(senhaHash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(senhaHash, plainPassword);
  } catch {
    // Hash malformado não deve derrubar o login nem revelar detalhes.
    return false;
  }
}
