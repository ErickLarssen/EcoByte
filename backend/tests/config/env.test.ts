import { describe, expect, it } from "vitest";
import { loadEnv } from "../../src/config/env.js";

const SECRET = "x".repeat(32);
const base = { MONGODB_URI: "mongodb://localhost:27017/ecobyte", SESSION_SECRET: SECRET };
const production = {
  ...base,
  NODE_ENV: "production",
  FRONTEND_URL: "https://ecobyte.exemplo",
  TRUST_PROXY: "1",
  SMTP_HOST: "smtp.ecobyte.exemplo",
};

describe("loadEnv", () => {
  it("aplica valores padrão fora de produção", () => {
    expect(loadEnv(base)).toEqual({
      NODE_ENV: "development",
      PORT: 4000,
      MONGODB_URI: "mongodb://localhost:27017/ecobyte",
      SESSION_SECRET: SECRET,
      SESSION_MAX_AGE: 604800,
      FRONTEND_URL: "http://localhost:3000",
      TRUST_PROXY: 0,
      SMTP_PORT: 587,
      SMTP_SECURE: false,
      MAIL_FROM: "EcoByte <nao-responda@ecobyte.local>",
      VIACEP_URL: "https://viacep.com.br",
    });
  });

  it("converte PORT, SESSION_MAX_AGE e TRUST_PROXY para número", () => {
    const env = loadEnv({ ...base, PORT: "5050", SESSION_MAX_AGE: "3600", TRUST_PROXY: "2" });

    expect(env.PORT).toBe(5050);
    expect(env.SESSION_MAX_AGE).toBe(3600);
    expect(env.TRUST_PROXY).toBe(2);
  });

  it("interrompe quando MONGODB_URI está ausente", () => {
    expect(() => loadEnv({ SESSION_SECRET: SECRET })).toThrow(/MONGODB_URI é obrigatória/);
  });

  it("interrompe quando SESSION_SECRET está ausente ou é curta (DEC-021)", () => {
    expect(() => loadEnv({ MONGODB_URI: base.MONGODB_URI })).toThrow(/SESSION_SECRET é obrigatória/);
    expect(() => loadEnv({ ...base, SESSION_SECRET: "curta" })).toThrow(/pelo menos 32 caracteres/);
  });

  it("interrompe quando NODE_ENV ou FRONTEND_URL são inválidos", () => {
    expect(() => loadEnv({ ...base, NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
    expect(() => loadEnv({ ...base, FRONTEND_URL: "localhost" })).toThrow(/FRONTEND_URL/);
  });

  it("aceita a configuração completa de produção", () => {
    const env = loadEnv(production);

    expect(env.FRONTEND_URL).toBe("https://ecobyte.exemplo");
    expect(env.TRUST_PROXY).toBe(1);
  });

  it("exige SMTP_HOST em produção (DEC-082)", () => {
    expect(() => loadEnv({ ...production, SMTP_HOST: undefined })).toThrow(/SMTP_HOST é obrigatória em produção/);
  });

  it("lê a configuração de SMTP", () => {
    const env = loadEnv({ ...base, SMTP_HOST: "smtp.exemplo", SMTP_PORT: "465", SMTP_SECURE: "true" });
    expect(env).toMatchObject({ SMTP_HOST: "smtp.exemplo", SMTP_PORT: 465, SMTP_SECURE: true });
  });

  it("exige FRONTEND_URL e TRUST_PROXY em produção (DEC-068, DEC-069)", () => {
    expect(() => loadEnv({ ...production, FRONTEND_URL: undefined })).toThrow(/FRONTEND_URL é obrigatória em produção/);
    expect(() => loadEnv({ ...production, TRUST_PROXY: undefined })).toThrow(/TRUST_PROXY é obrigatória em produção/);
  });

  it("aceita TRUST_PROXY=0 explícito em produção", () => {
    expect(loadEnv({ ...production, TRUST_PROXY: "0" }).TRUST_PROXY).toBe(0);
  });
});
