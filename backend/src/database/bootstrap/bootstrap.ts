import { z } from "zod";
import { Collection, Ecopoint, Notification, User } from "../../models/index.js";
import { hashPassword } from "../../utils/password.js";
import { enderecoShape } from "../../validators/address.validators.js";
import { emailSchema, passwordSchema, requiredText } from "../../validators/auth.validators.js";

// Inicialização de um banco novo, inclusive em produção (DEC-087). Ao contrário
// do seed (DEC-034), nunca apaga nem altera dados: só cria o que falta.

// Variáveis lidas pelo script. A senha do administrador é provisória: deve ser
// trocada no primeiro acesso (DEC-083), então não precisa ficar guardada.
const adminSchema = z.object({
  nome: requiredText("Informe BOOTSTRAP_ADMIN_NOME.", 120),
  email: emailSchema,
  senha: passwordSchema,
});

const ecopointSchema = z.object({
  nome: requiredText("Informe ECOPONTO_NOME.", 120),
  descricao: z
    .string()
    .trim()
    .max(500, "Máximo de 500 caracteres.")
    .optional()
    .transform((value) => value || null),
  endereco: z.object(enderecoShape),
});

export type BootstrapAdminInput = z.infer<typeof adminSchema>;
export type BootstrapEcopointInput = z.infer<typeof ecopointSchema>;

export type BootstrapInput = {
  admin?: BootstrapAdminInput;
  ecopoint?: BootstrapEcopointInput;
};

export type BootstrapStepResult = "CRIADO" | "JA_EXISTE" | "SEM_DADOS";
export type BootstrapSummary = { admin: BootstrapStepResult; ecopoint: BootstrapStepResult };

const ECOPOINT_VARIABLES = {
  ECOPONTO_LOGRADOURO: "logradouro",
  ECOPONTO_NUMERO: "numero",
  ECOPONTO_COMPLEMENTO: "complemento",
  ECOPONTO_BAIRRO: "bairro",
  ECOPONTO_CIDADE: "cidade",
  ECOPONTO_ESTADO: "estado",
  ECOPONTO_CEP: "cep",
} as const;

const ADMIN_VARIABLES = { nome: "BOOTSTRAP_ADMIN_NOME", email: "BOOTSTRAP_ADMIN_EMAIL", senha: "BOOTSTRAP_ADMIN_SENHA" };

// Nome da variável de cada campo, para a mensagem de erro (nunca o valor).
const ECOPOINT_FIELD_VARIABLES: Record<string, string> = {
  nome: "ECOPONTO_NOME",
  descricao: "ECOPONTO_DESCRICAO",
  ...Object.fromEntries(Object.entries(ECOPOINT_VARIABLES).map(([variable, field]) => [`endereco.${field}`, variable])),
};

function formatIssues(variables: Record<string, string>, error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return `  - ${variables[path] ?? path}: ${issue.message}`;
    })
    .join("\n");
}

const present = (value: string | undefined) => value !== undefined && value.trim() !== "";

// Lê as variáveis de ambiente. Um grupo sem nenhuma variável fica de fora (o
// passo correspondente é pulado); um grupo incompleto ou inválido é erro.
export function parseBootstrapEnv(source: NodeJS.ProcessEnv): BootstrapInput {
  const input: BootstrapInput = {};
  const errors: string[] = [];

  const adminValues = {
    nome: source.BOOTSTRAP_ADMIN_NOME,
    email: source.BOOTSTRAP_ADMIN_EMAIL,
    senha: source.BOOTSTRAP_ADMIN_SENHA,
  };
  if (Object.values(adminValues).some(present)) {
    const parsed = adminSchema.safeParse(adminValues);
    if (parsed.success) input.admin = parsed.data;
    else errors.push(formatIssues(ADMIN_VARIABLES, parsed.error));
  }

  const ecopointNames = ["ECOPONTO_NOME", "ECOPONTO_DESCRICAO", ...Object.keys(ECOPOINT_VARIABLES)];
  if (ecopointNames.some((name) => present(source[name]))) {
    const endereco = Object.fromEntries(
      Object.entries(ECOPOINT_VARIABLES).map(([variable, field]) => [field, source[variable]]),
    );
    const parsed = ecopointSchema.safeParse({
      nome: source.ECOPONTO_NOME,
      descricao: source.ECOPONTO_DESCRICAO,
      endereco,
    });
    if (parsed.success) input.ecopoint = parsed.data;
    else errors.push(formatIssues(ECOPOINT_FIELD_VARIABLES, parsed.error));
  }

  if (errors.length > 0) {
    throw new Error(`Variáveis de inicialização inválidas:\n${errors.join("\n")}`);
  }

  return input;
}

// Cria, se ainda não existirem, os índices, o primeiro administrador e o
// ecoponto central. Pode ser executado de novo sem efeito.
export async function runBootstrap(input: BootstrapInput): Promise<BootstrapSummary> {
  // createIndexes só cria os que faltam; não remove nenhum (19 §37).
  await Promise.all([User.createIndexes(), Collection.createIndexes(), Ecopoint.createIndexes(), Notification.createIndexes()]);

  return { admin: await ensureAdmin(input.admin), ecopoint: await ensureEcopoint(input.ecopoint) };
}

async function ensureAdmin(admin: BootstrapAdminInput | undefined): Promise<BootstrapStepResult> {
  if (await User.exists({ role: "ADMIN" })) return "JA_EXISTE";
  if (!admin) return "SEM_DADOS";

  // Uma conta existente com o mesmo e-mail não é promovida: mudar role continua
  // fora do escopo (OQ-054).
  if (await User.exists({ email: admin.email })) {
    throw new Error(`O e-mail ${admin.email} já pertence a outra conta. Use outro e-mail para o administrador.`);
  }

  await User.create({
    nome: admin.nome,
    email: admin.email,
    senhaHash: await hashPassword(admin.senha),
    role: "ADMIN",
    tipoCadastro: "PF",
    status: "ATIVO",
    emailVerificado: true,
    trocaSenhaObrigatoria: true,
  });

  return "CRIADO";
}

async function ensureEcopoint(ecopoint: BootstrapEcopointInput | undefined): Promise<BootstrapStepResult> {
  if (await Ecopoint.exists({})) return "JA_EXISTE";
  if (!ecopoint) return "SEM_DADOS";

  // Horários e localização ficam para o administrador (OQ-004, OQ-005).
  await Ecopoint.create({
    nome: ecopoint.nome,
    descricao: ecopoint.descricao,
    endereco: { ...ecopoint.endereco, complemento: ecopoint.endereco.complemento ?? null },
    status: "ATIVO",
  });

  return "CRIADO";
}
