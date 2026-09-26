import { Schema, model, type Document, type HydratedDocument, type InferSchemaType } from "mongoose";
import { findCollectionInvariantViolations, type CollectionSnapshot } from "../domain/collection-invariants.js";
import { COLLECTION_STATUSES, INITIAL_COLLECTION_STATUS } from "../domain/collection-status.js";
import { enderecoColetaSchema } from "./schemas/endereco.schema.js";
import { toJsonTransform } from "./schemas/to-json.js";
import { required } from "./schemas/validators.js";

// Item de descarte embutido (DEC-009). categoria e condicao sem lista fechada
// enquanto OQ-007/OQ-010 estiverem abertas: texto obrigatório em maiúsculas.
// Unidade de quantidade em aberto (OQ-009): apenas número maior que zero.
const itemDescarteSchema = new Schema(
  {
    categoria: { type: String, required: required("categoria é obrigatória."), trim: true, uppercase: true },
    quantidade: {
      type: Number,
      required: required("quantidade é obrigatória."),
      validate: {
        validator: (value: number) => Number.isFinite(value) && value > 0,
        message: "quantidade deve ser maior que zero.",
      },
    },
    condicao: { type: String, required: required("condicao é obrigatória."), trim: true, uppercase: true },
  },
  { _id: false },
);

const lifecycleTimestamp = { type: Date, default: null };

// Coleção `collections` (07_DATABASE_MONGODB §14, DEC-061).
const collectionSchema = new Schema(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "User", required: required("usuarioId é obrigatório.") },
    coletorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    ecopontoId: { type: Schema.Types.ObjectId, ref: "Ecopoint", default: null },
    enderecoColeta: { type: enderecoColetaSchema, required: required("enderecoColeta é obrigatório.") },
    itensDescarte: {
      type: [itemDescarteSchema],
      validate: {
        validator: (items: unknown[]) => Array.isArray(items) && items.length > 0,
        message: "A coleta deve possuir pelo menos um item de descarte.",
      },
    },
    // Agendamento em aberto (OQ-020, OQ-006): campo opcional.
    dataAgendada: { type: Date, default: null },
    status: {
      type: String,
      enum: { values: COLLECTION_STATUSES, message: "status inválido." },
      default: INITIAL_COLLECTION_STATUS,
    },
    observacoes: { type: String, trim: true, default: null },
    acceptedAt: lifecycleTimestamp,
    startedAt: lifecycleTimestamp,
    collectedAt: lifecycleTimestamp,
    deliveredAt: lifecycleTimestamp,
    completedAt: lifecycleTimestamp,
  },
  {
    timestamps: true,
    toJSON: { transform: toJsonTransform },
  },
);

// Defesa em profundidade para documentos salvos via save()/create():
// status, responsáveis e timestamps devem ser coerentes entre si.
// As transições em si são validadas pelos services (14_STATE_MACHINE §74).
collectionSchema.pre("validate", function () {
  const document = this as unknown as Document & CollectionSnapshot;
  const violations = findCollectionInvariantViolations(document);

  if (violations.length > 0) {
    document.invalidate("status", violations.join(" "));
  }
});

// Índices alinhados às consultas previstas (07 §49, 17 §63):
// minhas coletas (cliente), coletas disponíveis e coletas atribuídas.
collectionSchema.index({ usuarioId: 1, createdAt: -1 });
collectionSchema.index({ status: 1, createdAt: -1 });
collectionSchema.index({ coletorId: 1, createdAt: -1 });

export type CollectionAttributes = InferSchemaType<typeof collectionSchema>;
export type CollectionDocument = HydratedDocument<CollectionAttributes>;

export const Collection = model("Collection", collectionSchema, "collections");
