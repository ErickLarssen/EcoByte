import { describe, expect, it } from "vitest";
import { User } from "../../src/models/index.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const validUser = {
  nome: "Usuária Teste",
  email: "usuaria@ecobyte.local",
  senhaHash: "$argon2id$hash-de-teste",
  role: "CLIENTE",
  tipoCadastro: "PF",
};

describe("User model", () => {
  it("aplica padrões: status ATIVO e dados opcionais nulos", async () => {
    const user = await User.create(validUser);

    expect(user.status).toBe("ATIVO");
    expect(user.telefone).toBeNull();
    expect(user.documento).toBeNull();
    expect(user.dadosEmpresa).toBeNull();
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("normaliza o e-mail para minúsculas", async () => {
    const user = await User.create({ ...validUser, email: "  Usuaria@EcoByte.LOCAL " });

    expect(user.email).toBe("usuaria@ecobyte.local");
  });

  it("rejeita e-mail duplicado, sem diferenciar maiúsculas (BR-005, 17_TESTING §56)", async () => {
    await User.create(validUser);

    await expect(User.create({ ...validUser, email: "USUARIA@ecobyte.local" })).rejects.toMatchObject({
      code: 11000,
    });
  });

  it("rejeita e-mail inválido", async () => {
    await expect(User.create({ ...validUser, email: "sem-arroba" })).rejects.toThrow(/email inválido/);
  });

  it("rejeita role e tipoCadastro fora dos valores oficiais (BR-001, BR-002)", async () => {
    await expect(User.create({ ...validUser, role: "SUPERADMIN" })).rejects.toThrow(/role inválida/);
    await expect(User.create({ ...validUser, tipoCadastro: "MEI" })).rejects.toThrow(/tipoCadastro inválido/);
  });

  it("exige senhaHash e não persiste campo de senha em texto puro (17_TESTING §57)", async () => {
    const { senhaHash: _senhaHash, ...semHash } = validUser;
    await expect(User.create(semHash)).rejects.toThrow(/senhaHash é obrigatório/);

    const user = await User.create({ ...validUser, senha: "Senha@123" } as typeof validUser);
    const raw = await User.collection.findOne({ _id: user._id });

    expect(raw).not.toHaveProperty("senha");
    expect(raw).toHaveProperty("senhaHash");
  });

  it("não retorna senhaHash em consultas por padrão (BR-055)", async () => {
    await User.create(validUser);

    const found = await User.findOne({ email: validUser.email }).lean();
    const withHash = await User.findOne({ email: validUser.email }).select("+senhaHash").lean();

    expect(found).not.toHaveProperty("senhaHash");
    expect(withHash?.senhaHash).toBe(validUser.senhaHash);
  });

  it("expõe id e omite senhaHash e __v no JSON (06_API §40, §32)", async () => {
    const user = await User.create(validUser);
    const json = user.toJSON() as Record<string, unknown>;

    expect(json.id).toBe(String(user._id));
    expect(json).not.toHaveProperty("_id");
    expect(json).not.toHaveProperty("__v");
    expect(json).not.toHaveProperty("senhaHash");
  });

  it("armazena dados empresariais de PJ", async () => {
    const user = await User.create({
      ...validUser,
      tipoCadastro: "PJ",
      dadosEmpresa: { razaoSocial: "Empresa Teste Ltda.", nomeFantasia: "Empresa Teste" },
    });

    expect(user.dadosEmpresa).toMatchObject({ razaoSocial: "Empresa Teste Ltda.", nomeFantasia: "Empresa Teste" });
  });

  it("possui índice único de e-mail (17_TESTING §63)", async () => {
    const indexes = await User.listIndexes();

    expect(indexes).toContainEqual(expect.objectContaining({ key: { email: 1 }, unique: true }));
  });
});
