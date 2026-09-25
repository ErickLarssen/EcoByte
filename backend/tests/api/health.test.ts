import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

describe("GET /api/v1/health", () => {
  it("retorna 200 com o envelope de sucesso", async () => {
    const response = await request(createApp()).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(response.body).toEqual({
      status: "success",
      message: "API operacional.",
      data: { status: "up" },
    });
  });

  it("não expõe o header x-powered-by", async () => {
    const response = await request(createApp()).get("/api/v1/health");

    expect(response.headers["x-powered-by"]).toBeUndefined();
  });
});
