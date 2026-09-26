import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    // Argon2id é lento por projeto (DEC-020): testes com vários logins, rodando
    // em paralelo com outros arquivos, podem passar do limite padrão de 5 s.
    testTimeout: 20_000,
  },
});
