import { describe, expect, it } from "vitest";
import { loadEnv } from "../../src/config/env.js";

describe("loadEnv", () => {
  it("aplica valores padrão quando opcionais estão ausentes", () => {
    const env = loadEnv({ MONGODB_URI: "mongodb://localhost:27017/ecobyte" });

    expect(env).toEqual({
      NODE_ENV: "development",
      PORT: 4000,
      MONGODB_URI: "mongodb://localhost:27017/ecobyte",
    });
  });

  it("converte PORT para número", () => {
    const env = loadEnv({ MONGODB_URI: "mongodb://localhost/ecobyte", PORT: "5050" });

    expect(env.PORT).toBe(5050);
  });

  it("interrompe quando MONGODB_URI está ausente", () => {
    expect(() => loadEnv({})).toThrow(/MONGODB_URI/);
  });

  it("interrompe quando NODE_ENV é inválido", () => {
    expect(() => loadEnv({ MONGODB_URI: "mongodb://localhost/ecobyte", NODE_ENV: "staging" })).toThrow(
      /NODE_ENV/,
    );
  });

  it("interrompe quando FRONTEND_URL não é uma URL", () => {
    expect(() => loadEnv({ MONGODB_URI: "mongodb://localhost/ecobyte", FRONTEND_URL: "localhost" })).toThrow(
      /FRONTEND_URL/,
    );
  });
});
