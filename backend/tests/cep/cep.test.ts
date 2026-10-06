import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createViaCepProvider, type CepProvider } from "../../src/services/cep.service.js";
import { createUser, loginAgent } from "../helpers/auth.js";
import { validCollectionBody } from "../helpers/collections.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

type Agent = Awaited<ReturnType<typeof loginAgent>>;

const SAO_PAULO: Awaited<ReturnType<CepProvider>> = {
  cep: "01001000",
  logradouro: "Praça da Sé",
  bairro: "Sé",
  cidade: "São Paulo",
  estado: "SP",
};

let userCounter = 0;

// Cliente autenticado em uma aplicação com o provedor de CEP informado.
async function clienteFor(provider?: CepProvider): Promise<Agent> {
  const app = createTestApp({ trustProxy: 1, ...(provider ? { cepProvider: provider } : {}) });
  userCounter += 1;
  const email = `cliente${userCounter}@teste.local`;
  await createUser({ email });
  return loginAgent(app, email);
}

describe("GET /api/v1/cep/:cep (DEC-081)", () => {
  it("retorna o endereço e indica se o CEP é atendido", async () => {
    const agent = await clienteFor();

    const response = await agent.get("/api/v1/cep/09900-001");

    expect(response.status).toBe(200);
    expect(response.body.data.address).toEqual({
      cep: "09900001",
      logradouro: "Rua das Palmeiras",
      bairro: "Centro",
      cidade: "Diadema",
      estado: "SP",
      atendido: true,
    });
  });

  it("CEP fora de Diadema-SP: encontrado, mas não atendido", async () => {
    const agent = await clienteFor(async () => SAO_PAULO);
    const response = await agent.get("/api/v1/cep/01001000");
    expect(response.body.data.address).toMatchObject({ cidade: "São Paulo", atendido: false });
  });

  it("CEP inexistente responde 404", async () => {
    const agent = await clienteFor(async () => null);
    const response = await agent.get("/api/v1/cep/99999999");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("CEP não encontrado.");
  });

  it("formato inválido responde 400", async () => {
    const agent = await clienteFor();
    const response = await agent.get("/api/v1/cep/123");
    expect(response.status).toBe(400);
    expect(response.body.error.fields.cep).toBe("O CEP deve ter 8 dígitos.");
  });

  it("falha do serviço externo responde 503 CEP_SERVICE_UNAVAILABLE", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const agent = await clienteFor(async () => {
      throw new Error("timeout");
    });

    const response = await agent.get("/api/v1/cep/09900001");

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe("CEP_SERVICE_UNAVAILABLE");
    vi.restoreAllMocks();
  });

  it("exige sessão", async () => {
    expect((await request(createTestApp()).get("/api/v1/cep/09900001")).status).toBe(401);
  });
});

describe("createViaCepProvider", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("converte a resposta do ViaCEP", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ cep: "09900-001", logradouro: "Rua X", bairro: "Centro", localidade: "Diadema", uf: "SP" })),
    );
    vi.stubGlobal("fetch", fetchMock);

    const address = await createViaCepProvider("https://viacep.exemplo")("09900001");

    expect(fetchMock).toHaveBeenCalledWith("https://viacep.exemplo/ws/09900001/json/", expect.any(Object));
    expect(address).toEqual({ cep: "09900001", logradouro: "Rua X", bairro: "Centro", cidade: "Diadema", estado: "SP" });
  });

  it("{ erro: true } significa CEP inexistente", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ erro: "true" }))));
    expect(await createViaCepProvider("https://viacep.exemplo")("99999999")).toBeNull();
  });
});

describe("área de atendimento na solicitação de coleta (DEC-081)", () => {
  let agent: Agent;

  beforeEach(async () => {
    agent = await clienteFor();
  });

  it("recusa endereço fora de Diadema-SP", async () => {
    const response = await agent
      .post("/api/v1/collections")
      .send({ ...validCollectionBody, enderecoColeta: { ...validCollectionBody.enderecoColeta, cidade: "São Paulo" } });

    expect(response.status).toBe(400);
    expect(response.body.error.fields["enderecoColeta.cidade"]).toBe("Atendemos apenas endereços em Diadema-SP.");
  });

  it("recusa outra UF", async () => {
    const response = await agent
      .post("/api/v1/collections")
      .send({ ...validCollectionBody, enderecoColeta: { ...validCollectionBody.enderecoColeta, estado: "RJ" } });
    expect(response.status).toBe(400);
  });

  it("recusa CEP de fora de Diadema-SP, mesmo com a cidade informada como Diadema", async () => {
    const outside = await clienteFor(async () => SAO_PAULO);
    const response = await outside.post("/api/v1/collections").send(validCollectionBody);

    expect(response.status).toBe(400);
    expect(response.body.error.fields["enderecoColeta.cep"]).toBe("Atendemos apenas endereços em Diadema-SP.");
  });

  it("recusa CEP inexistente", async () => {
    const missing = await clienteFor(async () => null);
    const response = await missing.post("/api/v1/collections").send(validCollectionBody);

    expect(response.status).toBe(400);
    expect(response.body.error.fields["enderecoColeta.cep"]).toBe("CEP não encontrado.");
  });

  it("com o serviço de CEP fora do ar, aceita endereço de Diadema-SP", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const offline = await clienteFor(async () => {
      throw new Error("timeout");
    });

    expect((await offline.post("/api/v1/collections").send(validCollectionBody)).status).toBe(201);
    vi.restoreAllMocks();
  });

  it("aceita Diadema-SP sem diferenciar maiúsculas e grava a grafia oficial", async () => {
    const response = await agent
      .post("/api/v1/collections")
      .send({ ...validCollectionBody, enderecoColeta: { ...validCollectionBody.enderecoColeta, cidade: "  diadema " } });

    expect(response.status).toBe(201);
    expect(response.body.data.collection.enderecoColeta).toMatchObject({ cidade: "Diadema", estado: "SP" });
  });
});
