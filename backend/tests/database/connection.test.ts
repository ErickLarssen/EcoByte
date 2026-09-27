import type { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectDatabase, disconnectDatabase } from "../../src/database/connection.js";
import { createTestMongo } from "../helpers/test-database.js";

// Valida a infraestrutura de testes de integração com MongoDB real
// (mongodb-memory-server, DEC-062) que será usada a partir da Fase 2.
describe("conexão com o MongoDB", () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await createTestMongo();
  }, 120_000);

  afterAll(async () => {
    await disconnectDatabase();
    await mongo?.stop();
  });

  it("conecta, ativa strictQuery e desconecta", async () => {
    await connectDatabase(mongo.getUri());

    expect(mongoose.connection.readyState).toBe(1);
    expect(mongoose.get("strictQuery")).toBe(true);

    await disconnectDatabase();

    expect(mongoose.connection.readyState).toBe(0);
  });
});
