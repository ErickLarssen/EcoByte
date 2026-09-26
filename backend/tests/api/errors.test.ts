import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../helpers/test-app.js";
import { errorHandler } from "../../src/middlewares/error-handler.js";
import { AppError } from "../../src/utils/app-error.js";

function appThrowing(error: unknown) {
  const app = express();
  app.get("/boom", () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
}

describe("envelope de erro (DEC-017)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna 404 RESOURCE_NOT_FOUND para rota inexistente", async () => {
    const response = await request(createTestApp()).get("/api/v1/rota-inexistente");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "error",
      message: "Recurso não encontrado.",
      error: { code: "RESOURCE_NOT_FOUND", fields: {} },
      data: null,
    });
  });

  it("retorna 400 VALIDATION_ERROR para JSON malformado", async () => {
    const response = await request(createTestApp())
      .post("/api/v1/health")
      .set("Content-Type", "application/json")
      .send("{ invalido");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.data).toBeNull();
  });

  it("retorna 413 PAYLOAD_TOO_LARGE acima do limite de payload", async () => {
    const response = await request(createTestApp())
      .post("/api/v1/health")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ texto: "a".repeat(200 * 1024) }));

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("converte AppError no status, código e campos informados", async () => {
    const error = new AppError(409, "COLLECTION_ALREADY_ACCEPTED", "A coleta já foi aceita por outro coletor.", {
      id: "abc",
    });

    const response = await request(appThrowing(error)).get("/boom");

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      status: "error",
      message: "A coleta já foi aceita por outro coletor.",
      error: { code: "COLLECTION_ALREADY_ACCEPTED", fields: { id: "abc" } },
      data: null,
    });
  });

  it("retorna 500 genérico sem expor detalhes internos", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const internal = new Error("MongoServerError: mongodb://usuario:senha@host/ecobyte");

    const response = await request(appThrowing(internal)).get("/boom");

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(response.body.message).toBe("Não foi possível realizar a operação.");
    expect(JSON.stringify(response.body)).not.toContain("mongodb://");
    expect(JSON.stringify(response.body)).not.toContain("MongoServerError");
  });
});
