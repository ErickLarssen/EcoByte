import "express-session";
import type { PublicUser } from "../services/auth.service.js";

// Conteúdo da sessão no servidor (DEC-021): somente o identificador do usuário.
declare module "express-session" {
  interface SessionData {
    userId?: string;
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
