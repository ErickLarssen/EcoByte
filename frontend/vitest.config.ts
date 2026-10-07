import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Testes de componentes no navegador simulado (DEC-062).
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    // Testes de formulário digitam campo a campo (user-event); com todos os
    // arquivos em paralelo, ou no CI com poucos núcleos, passam dos 5 s padrão.
    testTimeout: 15_000,
  },
});
