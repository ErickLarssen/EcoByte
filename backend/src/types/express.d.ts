import "express-session";
import type { PublicUser } from "../services/auth.service.js";

// Conteúdo da sessão no servidor (DEC-021): o identificador do usuário e a
// versão das sessões dele no momento do login (DEC-088).
declare module "express-session" {
  interface SessionData {
    userId?: string;
    sessaoVersao?: number;
  }
}

// Usuário autenticado, carregado do banco a cada requisição protegida.
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}
