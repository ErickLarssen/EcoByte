import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "vitest";
import { connectDatabase, disconnectDatabase } from "../../src/database/connection.js";

// MongoDB real em memória por arquivo de teste (DEC-062, 17_TESTING §122).
// Os dados são limpos após cada teste; os índices são mantidos.
export function useTestDatabase(): void {
  let mongo: MongoMemoryServer | undefined;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await connectDatabase(mongo.getUri());
    await Promise.all(Object.values(mongoose.models).map((model) => model.createIndexes()));
  }, 120_000);

  afterEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    await Promise.all((collections ?? []).map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongo?.stop();
  });
}
