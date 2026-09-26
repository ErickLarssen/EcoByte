import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/utils/password.js";

describe("hash de senha (DEC-020: Argon2id)", () => {
  it("gera hash Argon2id sem conter a senha original", async () => {
    const hash = await hashPassword("Senha@123");

    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(hash).not.toContain("Senha@123");
  });

  it("gera hashes diferentes para a mesma senha (salt por hash)", async () => {
    const [first, second] = await Promise.all([hashPassword("Senha@123"), hashPassword("Senha@123")]);

    expect(first).not.toBe(second);
  });

  it("verifica a senha correta e rejeita a incorreta", async () => {
    const hash = await hashPassword("Senha@123");

    await expect(verifyPassword(hash, "Senha@123")).resolves.toBe(true);
    await expect(verifyPassword(hash, "senha@123")).resolves.toBe(false);
  });

  it("retorna false para hash malformado em vez de lançar erro", async () => {
    await expect(verifyPassword("hash-invalido", "Senha@123")).resolves.toBe(false);
  });
});
