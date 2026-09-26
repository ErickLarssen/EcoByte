import { loadEnv } from "../../config/env.js";
import { COLLECTION_STATUSES } from "../../domain/collection-status.js";
import { connectDatabase, disconnectDatabase } from "../connection.js";
import { assertSeedAllowed, runSeed } from "./seed.js";
import type { SeedSummary } from "./validate-seed.js";

function printSummary(nodeEnv: string, summary: SeedSummary): void {
  const line = "========================================";
  const pad = (label: string) => label.padEnd(20);

  console.info(
    [
      line,
      "EcoByte Seed",
      line,
      "",
      "Environment:",
      `  ${nodeEnv}`,
      "",
      "Users:",
      `  ${pad("ADMIN:")}${summary.users.ADMIN}`,
      `  ${pad("CLIENTE PF:")}${summary.users.CLIENTE_PF}`,
      `  ${pad("CLIENTE PJ:")}${summary.users.CLIENTE_PJ}`,
      `  ${pad("COLETOR:")}${summary.users.COLETOR}`,
      "",
      "Ecopoints:",
      `  ${summary.ecopoints}`,
      "",
      "Collections:",
      ...COLLECTION_STATUSES.map((status) => `  ${pad(`${status}:`)}${summary.collections[status]}`),
      "",
      "Notifications:",
      `  ${summary.notifications}`,
      "",
      "Validation:",
      "  ✓ Users, ecopoint, statuses, relationships, timestamps, state machine, indexes",
      "",
      "Seed completed successfully.",
      line,
    ].join("\n"),
  );
}

// CLI do seed mínimo: `npm run seed --workspace backend` (20_SEED_DATA §41).
async function main(): Promise<void> {
  const env = loadEnv();
  assertSeedAllowed(env.NODE_ENV);

  await connectDatabase(env.MONGODB_URI);

  try {
    const summary = await runSeed({ nodeEnv: env.NODE_ENV });
    printSummary(env.NODE_ENV, summary);
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  console.error("[seed] Falha:", error instanceof Error ? error.message : error);
  process.exit(1);
});
