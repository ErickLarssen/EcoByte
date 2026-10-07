import { describe, expect, it } from "vitest";
import { parseBootstrapEnv, runBootstrap } from "../../src/database/bootstrap/bootstrap.js";
import { Ecopoint, User } from "../../src/models/index.js";
import { verifyPassword } from "../../src/utils/password.js";
import { createUser } from "../helpers/auth.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const ADMIN_ENV = {
  BOOTSTRAP_ADMIN_NOME: "Ana Administradora",
  BOOTSTRAP_ADMIN_EMAIL: "Ana@EcoByte.Local",
  BOOTSTRAP_ADMIN_SENHA: "Provisoria@2026",
};

const ECOPOINT_ENV = {
  ECOPONTO_NOME: "Ecoponto EcoByte",
  ECOPONTO_LOGRADOURO: "Rua Exemplo",
  ECOPONTO_NUMERO: "10",
  ECOPONTO_BAIRRO: "Centro",
  ECOPONTO_CIDADE: "Diadema",
  ECOPONTO_ESTADO: "sp",
  ECOPONTO_CEP: "09910-000",
};

describe("parseBootstrapEnv (DEC-087)", () => {
  it("lê os dois grupos e normaliza e-mail, UF e CEP", () => {
    const input = parseBootstrapEnv({ ...ADMIN_ENV, ...ECOPOINT_ENV });

    expect(input.admin).toEqual({ nome: "Ana Administradora", email: "ana@ecobyte.local", senha: "Provisoria@2026" });
    expect(input.ecopoint?.endereco).toMatchObject({ estado: "SP", cep: "09910000" });
  });

  it("um grupo sem variáveis fica de fora", () => {
    expect(parseBootstrapEnv({})).toEqual({});
  });

  it("grupo incompleto é erro, com o nome da variável e sem exibir a senha", () => {
    const run = () =>
      parseBootstrapEnv({ ...ADMIN_ENV, BOOTSTRAP_ADMIN_SENHA: "fraca123", ECOPONTO_NOME: "Ecoponto EcoByte" });

    expect(run).toThrow(/BOOTSTRAP_ADMIN_SENHA: A senha deve conter pelo menos uma letra maiúscula/);
    expect(run).toThrow(/ECOPONTO_CEP/);
    expect(run).not.toThrow(/fraca123/);
  });
});

describe("runBootstrap (DEC-087)", () => {
  it("cria o administrador com senha provisória e o ecoponto", async () => {
    const summary = await runBootstrap(parseBootstrapEnv({ ...ADMIN_ENV, ...ECOPOINT_ENV }));

    expect(summary).toEqual({ admin: "CRIADO", ecopoint: "CRIADO" });

    const admin = await User.findOne({ email: "ana@ecobyte.local" }).select("+senhaHash").lean();
    expect(admin).toMatchObject({ role: "ADMIN", status: "ATIVO", emailVerificado: true, trocaSenhaObrigatoria: true });
    expect(await verifyPassword(admin!.senhaHash, "Provisoria@2026")).toBe(true);

    const ecopoint = await Ecopoint.findOne().lean();
    expect(ecopoint).toMatchObject({ nome: "Ecoponto EcoByte", status: "ATIVO", localizacao: null, horarios: [] });
  });

  it("executado de novo, não altera nada", async () => {
    await runBootstrap(parseBootstrapEnv({ ...ADMIN_ENV, ...ECOPOINT_ENV }));
    const before = await User.findOne({ role: "ADMIN" }).select("+senhaHash").lean();

    const summary = await runBootstrap(
      parseBootstrapEnv({ ...ADMIN_ENV, BOOTSTRAP_ADMIN_EMAIL: "outro@ecobyte.local", ...ECOPOINT_ENV, ECOPONTO_NOME: "Outro" }),
    );

    expect(summary).toEqual({ admin: "JA_EXISTE", ecopoint: "JA_EXISTE" });
    expect(await User.countDocuments({ role: "ADMIN" })).toBe(1);
    expect((await User.findOne({ role: "ADMIN" }).select("+senhaHash").lean())?.senhaHash).toBe(before?.senhaHash);
    expect(await Ecopoint.countDocuments()).toBe(1);
    expect((await Ecopoint.findOne().lean())?.nome).toBe("Ecoponto EcoByte");
  });

  it("sem variáveis, só informa o que falta", async () => {
    expect(await runBootstrap({})).toEqual({ admin: "SEM_DADOS", ecopoint: "SEM_DADOS" });
    expect(await User.countDocuments()).toBe(0);
  });

  it("não promove uma conta existente com o mesmo e-mail", async () => {
    await createUser({ email: "ana@ecobyte.local", role: "CLIENTE" });

    await expect(runBootstrap(parseBootstrapEnv(ADMIN_ENV))).rejects.toThrow(/já pertence a outra conta/);
    expect((await User.findOne({ email: "ana@ecobyte.local" }).lean())?.role).toBe("CLIENTE");
  });
});
