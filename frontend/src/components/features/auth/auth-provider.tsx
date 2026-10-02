"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "@/lib/api/auth";
import type { LoginPayload, RegisterPayload, User } from "@/lib/api/auth";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated"; user: null };

type AuthContextValue = AuthState & {
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  // Atualiza o usuário exibido após mudanças no próprio perfil (DEC-078).
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Estado de autenticação da interface. A sessão fica no servidor (DEC-021);
// aqui guardamos apenas o usuário retornado por /auth/me para apresentação.
// Não é mecanismo de segurança: a API valida tudo (11 §129, DEC-038).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });
  // Dados em cache pertencem ao usuário da sessão: são descartados ao trocar de
  // usuário ou sair, para não exibir dados de outra conta no mesmo navegador.
  const queryClient = useQueryClient();

  // Restaura a sessão ao carregar a aplicação.
  useEffect(() => {
    const controller = new AbortController();

    authApi
      .getCurrentUser(controller.signal)
      .then((user) => setState({ status: "authenticated", user }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "unauthenticated", user: null });
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const user = await authApi.login(payload);
      queryClient.clear();
      setState({ status: "authenticated", user });
      return user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const user = await authApi.register(payload);
      queryClient.clear();
      setState({ status: "authenticated", user });
      return user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Mesmo se a sessão já tiver expirado no servidor, a interface sai.
      queryClient.clear();
      setState({ status: "unauthenticated", user: null });
    }
  }, [queryClient]);

  const updateUser = useCallback((user: User) => setState({ status: "authenticated", user }), []);

  const value = useMemo(
    () => ({ ...state, login, register, logout, updateUser }),
    [state, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  }

  return context;
}
