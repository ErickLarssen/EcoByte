import { Schema, model } from "mongoose";

// Coleção `login_throttles` (DEC-093): falhas de login por conta, para o
// bloqueio temporário contra força bruta. Guarda só o hash do e-mail, nunca o
// e-mail, e cada registro é apagado pelo MongoDB depois de `expiraEm` (TTL).
const loginThrottleSchema = new Schema(
  {
    chave: { type: String, required: true },
    falhas: { type: Number, default: 0 },
    janelaInicio: { type: Date, required: true },
    bloqueadoAte: { type: Date, default: null },
    expiraEm: { type: Date, required: true },
  },
  { versionKey: false },
);

loginThrottleSchema.index({ chave: 1 }, { unique: true });
loginThrottleSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 });

export const LoginThrottle = model("LoginThrottle", loginThrottleSchema, "login_throttles");
