import type { UserRole } from "./api/auth";

// Área de cada perfil (DEC-072).
export const ROLE_HOME: Record<UserRole, string> = {
  CLIENTE: "/cliente",
  COLETOR: "/coletor",
  ADMIN: "/admin",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  CLIENTE: "Cliente",
  COLETOR: "Coletor",
  ADMIN: "Administrador",
};

export const LOGIN_PATH = "/entrar";
// Troca obrigatória da senha provisória (DEC-083).
export const CHANGE_PASSWORD_PATH = "/trocar-senha";
export const RETURN_PARAM = "proximo";

// Somente caminhos internos: bloqueia "//site.com", "/\site.com" e URLs absolutas,
// evitando redirecionamento aberto para outro domínio.
export function isSafeInternalPath(path: string | null | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");
}

export function isWithinArea(path: string, area: string): boolean {
  return path === area || path.startsWith(`${area}/`);
}

// Destino após login/cadastro: a página solicitada, se pertencer à área do
// perfil; caso contrário, a área do perfil (DEC-072).
export function postLoginDestination(role: UserRole, requested: string | null | undefined): string {
  const home = ROLE_HOME[role];
  return isSafeInternalPath(requested) && isWithinArea(requested, home) ? requested : home;
}

export function loginRedirectPath(currentPath: string): string {
  return `${LOGIN_PATH}?${RETURN_PARAM}=${encodeURIComponent(currentPath)}`;
}

// Leva o destino pedido (?proximo=) de uma página de visitante para outra,
// como entre "Entrar" e "Criar conta" (DEC-079).
export function withReturnParam(path: string, requested: string | null | undefined): string {
  return isSafeInternalPath(requested) ? `${path}?${RETURN_PARAM}=${encodeURIComponent(requested)}` : path;
}
