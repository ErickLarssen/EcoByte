import request from "supertest";
import { describe, expect, it } from "vitest";
import { User } from "../../src/models/index.js";
import { sessionCookie, validPF, validPJ } from "../helpers/auth.js";
import { createTestApp } from "../helpers/test-app.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const register = (body: unknown) => request(createTestApp()).post("/api/v1/auth/register").send(body as object);

describe("POST /api/v1/auth/register (17_TESTING §29, §40)", () => {
  it("cadastra PF: 201, usuário público, CLIENTE ATIVO e sessão iniciada", async () => {
    const response = await register(validPF);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: "success",
      message: "Cadastro realizado com sucesso. Enviamos um link para confirmar seu e-mail.",
      data: {
        user: {
          id: expect.any(String),
          nome: "Mariana Teste",
          email: "mariana@teste.local",
          role: "CLIENTE",
          tipoCadastro: "PF",
          status: "ATIVO",
          emailVerificado: false,
        },
      },
    });

    const cookie = sessionCookie(response.headers["set-cookie"]);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  it("autentica o usuário logo após o cadastro (CA-001)", async () => {
    const agent = request.agent(createTestApp());
    await agent.post("/api/v1/auth/register").send(validPF).expect(201);

    const me = await agent.get("/api/v1/auth/me");

    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(validPF.email);
  });

  it("cadastra PJ com dados empresariais (DEC-066)", async () => {
    const response = await register(validPJ);

    expect(response.status).toBe(201);
    const stored = await User.findOne({ email: validPJ.email });
    expect(stored?.tipoCadastro).toBe("PJ");
    expect(stored?.dadosEmpresa).toMatchObject(validPJ.dadosEmpresa);
  });

  it("armazena somente o hash Argon2id, nunca a senha (17_TESTING §57)", async () => {
    await register(validPF).expect(201);

    const raw = await User.collection.findOne({ email: validPF.email });

    expect(raw?.senhaHash).toMatch(/^\$argon2id\$/);
    expect(raw).not.toHaveProperty("senha");
    expect(raw).not.toHaveProperty("confirmacaoSenha");
    expect(JSON.stringify(raw)).not.toContain(validPF.senha);
  });

  it("normaliza o e-mail em minúsculas e sem espaços", async () => {
    const response = await register({ ...validPF, email: "  Mariana@Teste.LOCAL " });

    expect(response.body.data.user.email).toBe("mariana@teste.local");
  });

  it("ignora role e status enviados pelo cliente (09 §75, §77)", async () => {
    const response = await register({ ...validPF, role: "ADMIN", status: "INATIVO" });

    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe("CLIENTE");
    expect(response.body.data.user.status).toBe("ATIVO");
  });

  it("rejeita e-mail duplicado, sem diferenciar maiúsculas, com 409 (BR-005)", async () => {
    await register(validPF).expect(201);

    const response = await register({ ...validPF, email: "MARIANA@teste.local" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("rejeita e-mail inválido", async () => {
    const response = await register({ ...validPF, email: "sem-arroba" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual({
      code: "VALIDATION_ERROR",
      fields: { email: "Informe um e-mail válido." },
    });
  });

  it.each([
    ["curta", "Ab@1", "A senha deve ter pelo menos 8 caracteres."],
    ["sem maiúscula", "senha@123", "A senha deve conter pelo menos uma letra maiúscula."],
    ["sem minúscula", "SENHA@123", "A senha deve conter pelo menos uma letra minúscula."],
    ["sem número", "Senha@abc", "A senha deve conter pelo menos um número."],
    ["sem caractere especial", "Senha1234", "A senha deve conter pelo menos um caractere especial."],
  ])("rejeita senha %s (DEC-019)", async (_caso, senha, mensagem) => {
    const response = await register({ ...validPF, senha, confirmacaoSenha: senha });

    expect(response.status).toBe(400);
    expect(response.body.error.fields.senha).toBe(mensagem);
  });

  it("rejeita confirmação diferente da senha", async () => {
    const response = await register({ ...validPF, confirmacaoSenha: "Outra@123" });

    expect(response.status).toBe(400);
    expect(response.body.error.fields).toEqual({ confirmacaoSenha: "A confirmação deve ser igual à senha." });
  });

  it("rejeita campos obrigatórios ausentes, indicando cada campo", async () => {
    const response = await register({});

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.error.fields).sort()).toEqual(
      ["confirmacaoSenha", "email", "nome", "senha", "tipoCadastro"].sort(),
    );
  });

  it("exige razão social para PJ", async () => {
    const { dadosEmpresa: _dadosEmpresa, ...semEmpresa } = validPJ;

    const response = await register(semEmpresa);

    expect(response.status).toBe(400);
    expect(response.body.error.fields).toEqual({ "dadosEmpresa.razaoSocial": "Informe a razão social." });
  });

  it("não aceita dados empresariais em cadastro PF", async () => {
    const response = await register({ ...validPF, dadosEmpresa: validPJ.dadosEmpresa });

    expect(response.status).toBe(400);
    expect(response.body.error.fields.dadosEmpresa).toMatch(/somente a cadastros PJ/);
  });

  it("aceita telefone opcional", async () => {
    await register({ ...validPF, telefone: " 11999999999 " }).expect(201);

    const stored = await User.findOne({ email: validPF.email });
    expect(stored?.telefone).toBe("11999999999");
  });

  it("não expõe senhaHash nem segredos na resposta (17_TESTING §111)", async () => {
    const response = await register(validPF);
    const body = JSON.stringify(response.body);

    expect(body).not.toContain("senhaHash");
    expect(body).not.toContain(validPF.senha);
  });
});
