import { Schema, model, type InferSchemaType, type MongooseQueryMiddleware } from "mongoose";

// Coleção `audit_logs` (DEC-094, OQ-056): ações administrativas e sensíveis.
// Só recebe inclusões: atualizações e exclusões pelo Mongoose são recusadas.
// Guarda identificadores e papéis, nunca nomes, e-mails ou outros dados
// pessoais. Os nomes são resolvidos na leitura, então uma conta excluída não
// deixa o nome no registro.
export const AUDIT_ACTIONS = [
  "ADMIN_INICIAL_CRIADO",
  "COLETOR_CADASTRADO",
  "USUARIO_ATIVADO",
  "USUARIO_DESATIVADO",
  "ECOPONTO_ATUALIZADO",
  "CONTA_EXCLUIDA",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// SISTEMA: ação sem usuário autenticado (ex.: script de inicialização, DEC-087).
export const AUDIT_ACTOR_ROLES = ["ADMIN", "CLIENTE", "COLETOR", "SISTEMA"] as const;

const auditLogSchema = new Schema(
  {
    acao: { type: String, enum: AUDIT_ACTIONS, required: true },
    ator: {
      id: { type: Schema.Types.ObjectId, ref: "User", default: null },
      role: { type: String, enum: AUDIT_ACTOR_ROLES, required: true },
    },
    alvo: {
      tipo: { type: String, enum: ["USUARIO", "ECOPONTO"], required: true },
      id: { type: Schema.Types.ObjectId, required: true },
    },
    // Detalhes sem dados pessoais (ex.: novo status, nomes dos campos alterados).
    detalhes: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

auditLogSchema.index({ createdAt: -1, _id: -1 });
auditLogSchema.index({ "alvo.tipo": 1, "alvo.id": 1, createdAt: -1 });

// Imutável pela aplicação: nenhuma rota altera ou apaga registros.
const IMMUTABLE_OPERATIONS: MongooseQueryMiddleware[] = [
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "replaceOne",
  "findOneAndReplace",
  "deleteOne",
  "deleteMany",
  "findOneAndDelete",
];

auditLogSchema.pre(IMMUTABLE_OPERATIONS, { document: false, query: true }, function () {
  throw new Error("Registros de auditoria não podem ser alterados nem apagados.");
});

export type AuditLogAttributes = InferSchemaType<typeof auditLogSchema>;

export const AuditLog = model("AuditLog", auditLogSchema, "audit_logs");
