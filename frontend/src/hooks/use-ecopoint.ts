"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEcopoint, updateEcopoint, type UpdateEcopointPayload } from "@/lib/api/ecopoint";

export const ecopointKeys = { central: ["ecopoint"] as const };

export function useEcopoint() {
  return useQuery({ queryKey: ecopointKeys.central, queryFn: ({ signal }) => getEcopoint(signal) });
}

// A tela só muda após a resposta da API, que devolve o ecoponto atualizado.
export function useUpdateEcopoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEcopointPayload) => updateEcopoint(payload),
    onSuccess: (ecopoint) => queryClient.setQueryData(ecopointKeys.central, ecopoint),
  });
}
