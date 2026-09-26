import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { RECORD_STATUSES } from "../domain/constants.js";
import { enderecoSchema } from "./schemas/endereco.schema.js";
import { geoPointSchema } from "./schemas/geo-point.schema.js";
import { toJsonTransform } from "./schemas/to-json.js";
import { required } from "./schemas/validators.js";

// Coleção `ecopoints` (07_DATABASE_MONGODB §33). O MVP possui um único
// ecoponto central (DEC-002); a coleção permite expansão futura.
const ecopointSchema = new Schema(
  {
    nome: { type: String, required: required("nome é obrigatório."), trim: true },
    descricao: { type: String, trim: true, default: null },
    endereco: { type: enderecoSchema, required: required("endereco é obrigatório.") },
    localizacao: { type: geoPointSchema, default: null },
    // Estrutura dos horários em aberto (OQ-005): lista sem formato imposto.
    horarios: { type: [Schema.Types.Mixed], default: [] },
    status: {
      type: String,
      enum: { values: RECORD_STATUSES, message: "status inválido." },
      default: "ATIVO",
    },
  },
  {
    timestamps: true,
    toJSON: { transform: toJsonTransform },
  },
);

// Consultas geoespaciais sobre o ecoponto (DEC-012, 20_SEED_DATA §8).
ecopointSchema.index({ localizacao: "2dsphere" });

export type EcopointAttributes = InferSchemaType<typeof ecopointSchema>;
export type EcopointDocument = HydratedDocument<EcopointAttributes>;

export const Ecopoint = model("Ecopoint", ecopointSchema, "ecopoints");
