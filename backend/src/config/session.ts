import session, { type Store } from "express-session";

export const SESSION_COOKIE_NAME = "ecobyte.sid";

// Em produção, o prefixo __Host- obriga o navegador a só aceitar o cookie com
// Secure, Path=/ e sem Domain, impedindo que outro subdomínio o injete ou
// sobrescreva (DEC-091). Em HTTP local, o prefixo seria recusado.
export function sessionCookieName(secureCookies: boolean): string {
  return secureCookies ? `__Host-${SESSION_COOKIE_NAME}` : SESSION_COOKIE_NAME;
}

// Sessão do administrador: expira após 30 minutos sem uso (DEC-092). Os demais
// perfis seguem SESSION_MAX_AGE (7 dias, DEC-021). Como a sessão é renovada a
// cada resposta (rolling), é um limite de inatividade.
export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export type SessionOptions = {
  secret: string;
  maxAgeSeconds: number;
  secureCookies: boolean;
  store: Store;
};

// Opções do cookie compartilhadas entre a criação e a remoção (logout).
export function sessionCookieOptions(secureCookies: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: secureCookies,
    path: "/",
  };
}

// Sessão no servidor com cookie HttpOnly (DEC-021):
// - rolling: cada resposta autenticada renova a expiração (7 dias sem uso);
// - saveUninitialized: nenhuma sessão é criada para visitantes anônimos.
export function createSessionMiddleware({ secret, maxAgeSeconds, secureCookies, store }: SessionOptions) {
  return session({
    name: sessionCookieName(secureCookies),
    secret,
    store,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      ...sessionCookieOptions(secureCookies),
      maxAge: maxAgeSeconds * 1000,
    },
  });
}
