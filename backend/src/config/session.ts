import session, { type Store } from "express-session";

export const SESSION_COOKIE_NAME = "ecobyte.sid";

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
    name: SESSION_COOKIE_NAME,
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
