import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { toJsonTransform } from "./schemas/to-json.js";
import { required } from "./schemas/validators.js";

// Referência opcional ao recurso relacionado (07_DATABASE_MONGODB §39).
const referenciaSchema = new Schema(
  {
    tipo: { type: String, required: required("referencia.tipo é obrigatório."), trim: true, uppercase: true },
    id: { type: Schema.Types.ObjectId, required: required("referencia.id é obrigatório.") },
  },
  { _id: false },
);

// Coleção `notifications` (07_DATABASE_MONGODB §37, DEC-025).
// Tipos oficiais em aberto (OQ-013): texto obrigatório em maiúsculas.
const notificationSchema = new Schema(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "User", required: required("usuarioId é obrigatório.") },
    tipo: { type: String, required: required("tipo é obrigatório."), trim: true, uppercase: true },
    titulo: { type: String, required: required("titulo é obrigatório."), trim: true },
    mensagem: { type: String, required: required("mensagem é obrigatória."), trim: true },
    referencia: { type: referenciaSchema, default: null },
    lida: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { transform: toJsonTransform },
  },
);

// Notificações do usuário, mais recentes primeiro (07 §49).
notificationSchema.index({ usuarioId: 1, createdAt: -1 });

export type NotificationAttributes = InferSchemaType<typeof notificationSchema>;
export type NotificationDocument = HydratedDocument<NotificationAttributes>;

export const Notification = model("Notification", notificationSchema, "notifications");
