"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/features/auth/auth-provider";
import { changePassword, getProfile, updateProfile, type UpdateProfilePayload } from "@/lib/api/profile";

export const profileKeys = { current: ["profile"] as const };

export function useProfile() {
  return useQuery({ queryKey: profileKeys.current, queryFn: ({ signal }) => getProfile(signal) });
}

// Após salvar, o perfil em cache e o usuário do cabeçalho passam a refletir a API.
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.current, profile);
      const { id, nome, email, role, tipoCadastro, status } = profile;
      // O perfil não altera a verificação do e-mail: mantém o valor atual.
      updateUser({ id, nome, email, role, tipoCadastro, status, emailVerificado: user?.emailVerificado ?? true });
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
