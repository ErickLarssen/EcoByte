import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { RECORD_STATUSES, TIPOS_CADASTRO, USER_ROLES } from "../domain/constants.js";
import { toJsonTransform } from "./schemas/to-json.js";
import { required } from "./schemas/validators.js";

// Campos definitivos de PJ ainda em aberto (OQ-042): todos opcionais.
const dadosEmpresaSchema = new Schema(
  {
    razaoSocial: { type: String, trim: true },
    nomeFantasia: { type: String, trim: true },
  },
  { _id: false },
);

// Função nomeada (e não inline) para não interferir na inferência de tipos do schema.
function userToJson(doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
  const json = toJsonTransform(doc, ret);
  delete json.senhaHash;
  delete json.emailVerificacaoTokenHash;
  delete json.emailVerificacaoExpiraEm;
  return json;
}

// Coleção `users` (07_DATABASE_MONGODB §7, DEC-061).
// telefone e documento: obrigatoriedade em aberto (OQ-043, OQ-044, OQ-045).
const userSchema = new Schema(
  {
    nome: { type: String, required: required("nome é obrigatório."), trim: true },
    email: {
      type: String,
      required: required("email é obrigatório."),
      trim: true,
      // Comparação sem diferenciar maiúsculas/minúsculas (BR-005).
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "email inválido."] as [RegExp, string],
    },
    // Nunca retornado por padrão (BR-055); consultas de login usam select("+senhaHash").
    senhaHash: { type: String, required: required("senhaHash é obrigatório."), select: false },
    telefone: { type: String, trim: true, default: null },
    documento: { type: String, trim: true, default: null },
    role: {
      type: String,
      enum: { values: USER_ROLES, message: "role inválida." },
      required: required("role é obrigatória."),
    },
    tipoCadastro: {
      type: String,
      enum: { values: TIPOS_CADASTRO, message: "tipoCadastro inválido." },
      required: required("tipoCadastro é obrigatório."),
    },
    dadosEmpresa: { type: dadosEmpresaSchema, default: null },
    status: {
      type: String,
      enum: { values: RECORD_STATUSES, message: "status inválido." },
      default: "ATIVO",
    },
    // Verificação de e-mail (DEC-082). O padrão é true: contas criadas pela
    // equipe (coletor, admin, seed) e as anteriores à verificação contam como
    // verificadas; só o cadastro público grava false até a confirmação.
    // Leituras devem tratar o campo ausente como verificado.
    emailVerificado: { type: Boolean, default: true },
    // Hash SHA-256 do token enviado por e-mail; o token em si nunca é guardado.
    emailVerificacaoTokenHash: { type: String, default: null, select: false },
    emailVerificacaoExpiraEm: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: { transform: userToJson },
  },
);

// E-mail único (BR-005, 07 §12.1).
userSchema.index({ email: 1 }, { unique: true });

// Busca do token de verificação (DEC-082); só documentos com token pendente.
userSchema.index(
  { emailVerificacaoTokenHash: 1 },
  { partialFilterExpression: { emailVerificacaoTokenHash: { $type: "string" } } },
);

export type UserAttributes = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserAttributes>;

export const User = model("User", userSchema, "users");
